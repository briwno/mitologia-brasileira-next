'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function defaultParseResponse(json, responseKey) {
  if (!json) return [];
  if (responseKey && json[responseKey]) return json[responseKey];
  if (Array.isArray(json)) return json;
  return [];
}

function isEmptyValue(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj || {}, key);
}

const DEFAULT_SKILL_FIELDS = ['name', 'description', 'kind', 'base', 'cost', 'ppMax'];
const DEFAULT_PASSIVE_FIELDS = ['name', 'description'];

function getSkillKeys(field) {
  if (Array.isArray(field.skillKeys) && field.skillKeys.length > 0) {
    return field.skillKeys;
  }
  return ['skill1', 'skill2', 'skill3', 'skill4', 'skill5'];
}

function getSkillFields(field) {
  if (Array.isArray(field.skillFields) && field.skillFields.length > 0) {
    return field.skillFields;
  }
  return DEFAULT_SKILL_FIELDS;
}

function getPassiveFields(field) {
  if (Array.isArray(field.passiveFields) && field.passiveFields.length > 0) {
    return field.passiveFields;
  }
  return DEFAULT_PASSIVE_FIELDS;
}

function buildDefaultAbilities(field) {
  const defaults = {};
  const skillFields = getSkillFields(field);
  const skillKeys = getSkillKeys(field);

  skillKeys.forEach((key) => {
    const base = {};
    skillFields.forEach((fieldName) => {
      base[fieldName] = '';
    });
    defaults[key] = base;
  });

  if (field.includePassive !== false) {
    const passiveFields = getPassiveFields(field);
    const passiveDefaults = {};
    passiveFields.forEach((fieldName) => {
      passiveDefaults[fieldName] = '';
    });
    defaults.passive = passiveDefaults;
  }

  return defaults;
}

function normalizeAbilitiesValue(field, rawValue) {
  const defaults = buildDefaultAbilities(field);
  if (!rawValue || typeof rawValue !== 'object') {
    return defaults;
  }

  const skillFields = getSkillFields(field);
  const passiveFields = getPassiveFields(field);

  Object.entries(defaults).forEach(([key, defaultValue]) => {
    const source = rawValue[key];
    if (!source || typeof source !== 'object') {
      defaults[key] = { ...defaultValue };
      return;
    }

    const target = { ...defaultValue };
    const fieldsToConsider = key === 'passive' ? passiveFields : skillFields;

    fieldsToConsider.forEach((fieldName) => {
      if (hasOwn(source, fieldName)) {
        target[fieldName] = source[fieldName] ?? '';
      }
    });

    defaults[key] = target;
  });

  return defaults;
}

function coerceAbilityNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

function getDefaultValue(field) {
  if (field.defaultValue !== undefined) {
    if (field.type === 'boolean') return Boolean(field.defaultValue);
    if (field.type === 'list' || field.type === 'multi-select') {
      return Array.isArray(field.defaultValue) ? [...field.defaultValue] : [];
    }
    if (field.type === 'object' && field.fields) {
      const obj = {};
      field.fields.forEach((subField) => {
        obj[subField.name] = getDefaultValue(subField);
      });
      return obj;
    }
    return field.defaultValue;
  }

  switch (field.type) {
    case 'boolean':
      return false;
    case 'list':
    case 'multi-select':
      return [];
    case 'abilities':
      return buildDefaultAbilities(field);
    case 'object': {
      const obj = {};
      (field.fields || []).forEach((subField) => {
        obj[subField.name] = getDefaultValue(subField);
      });
      return obj;
    }
    default:
      return '';
  }
}

function buildDefaultValuesFromFields(fields = []) {
  const obj = {};
  fields.forEach((field) => {
    obj[field.name] = getDefaultValue(field);
  });
  return obj;
}

function formatFieldValue(field, raw, source) {
  if (field.formatValue) {
    return field.formatValue(raw, source);
  }

  switch (field.type) {
    case 'boolean':
      return Boolean(raw);
    case 'json':
      return raw ? JSON.stringify(raw, null, 2) : '';
    case 'array':
    case 'tags':
      if (Array.isArray(raw)) return raw.join(', ');
      if (typeof raw === 'string') return raw;
      return '';
    case 'list':
    case 'multi-select':
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string') {
        return raw
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
      return [];
    case 'object': {
      const obj = {};
      (field.fields || []).forEach((subField) => {
        const subRaw = raw?.[subField.name];
        obj[subField.name] = formatFieldValue(subField, subRaw, raw);
      });
      return obj;
    }
    case 'abilities': {
      return normalizeAbilitiesValue(field, raw);
    }
    case 'number':
      return raw ?? '';
    default:
      return raw ?? '';
  }
}

function FieldInput({ field, value, onChange, nested = false, loading = false }) {
  switch (field.type) {
    case 'list':
      return <ListField field={field} value={value} onChange={onChange} />;
    case 'multi-select':
      return <MultiSelectField field={field} value={value} onChange={onChange} loading={loading} />;
    case 'object':
      return <ObjectField field={field} value={value} onChange={onChange} />;
    case 'abilities':
      return <AbilitiesField field={field} value={value} onChange={onChange} />;
    default:
      return <BasicField field={field} value={value} onChange={onChange} nested={nested} />;
  }
}

function BasicField({ field, value, onChange, nested }) {
  if (field.type === 'boolean') {
    return (
      <label className="inline-flex items-center gap-3 text-sm text-slate-200">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
        />
        {field.switchLabel || field.label || 'Ativo'}
      </label>
    );
  }

  const baseClassName = cn(
    'w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40',
    nested ? 'border-slate-800/80 bg-slate-900/40' : ''
  );

  const sharedProps = {
    id: field.name,
    name: field.name,
    placeholder: field.placeholder,
    className: baseClassName,
    value: field.type === 'number' ? value ?? '' : value ?? '',
    onChange: (event) => onChange(event.target.value),
  };

  if (field.type === 'textarea') {
    return <textarea rows={field.rows || 4} {...sharedProps} />;
  }

  if (field.type === 'select') {
    return (
      <div className="space-y-2">
        <select
          {...sharedProps}
          className={cn(baseClassName, 'appearance-none pr-10')}
        >
          <option value="">Selecione</option>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {field.suggestions?.length ? (
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            {field.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onChange(suggestion)}
                className="rounded-lg border border-slate-700/60 px-2 py-1 text-xs text-slate-200 hover:border-emerald-400/60 hover:text-emerald-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <input
        type="number"
        {...sharedProps}
        onChange={(event) => {
          const newValue = event.target.value;
          onChange(newValue === '' ? '' : Number(newValue));
        }}
      />
    );
  }

  return (
    <div className="space-y-2">
      <input type="text" {...sharedProps} />
      {field.suggestions?.length ? (
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          {field.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onChange(suggestion)}
              className="rounded-lg border border-slate-700/60 px-2 py-1 text-xs text-slate-200 hover:border-emerald-400/60 hover:text-emerald-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ListField({ field, value, onChange }) {
  const [draft, setDraft] = useState('');
  const items = useMemo(() => (Array.isArray(value) ? value : []), [value]);
  const allowDuplicates = field.allowDuplicates ?? false;

  const addItem = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!allowDuplicates && items.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...items, trimmed]);
    setDraft('');
  }, [allowDuplicates, draft, items, onChange]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addItem();
    }
  };

  const removeItem = (index) => {
    onChange(items.filter((_, idx) => idx !== index));
  };

  const handleSuggestion = (suggestion) => {
    if (!allowDuplicates && items.includes(suggestion)) return;
    onChange([...items, suggestion]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={field.placeholder || 'Digite e pressione Enter'}
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <button
          type="button"
          onClick={addItem}
          className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 shadow hover:bg-emerald-400"
        >
          Adicionar
        </button>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-2 rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-200"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-slate-400 hover:text-red-400"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : null}
      {field.suggestions?.length ? (
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          {field.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestion(suggestion)}
              className="rounded-lg border border-slate-700/60 px-2 py-1 text-xs text-slate-200 hover:border-emerald-400/60 hover:text-emerald-200"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MultiSelectField({ field, value, onChange, loading }) {
  const selected = Array.isArray(value) ? value : [];
  const [customValue, setCustomValue] = useState('');

  const toggleOption = (optionValue) => {
    if (selected.includes(optionValue)) {
      onChange(selected.filter((item) => item !== optionValue));
      return;
    }
    onChange([...selected, optionValue]);
  };

  const addCustomOption = () => {
    const trimmed = customValue.trim();
    if (!trimmed) return;
    if (!selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setCustomValue('');
  };

  const handleCustomKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addCustomOption();
    }
  };

  const handleSuggestion = (suggestion) => {
    if (!selected.includes(suggestion)) {
      onChange([...selected, suggestion]);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-lg border border-slate-800/70 bg-slate-900/40 p-3 text-sm text-slate-300">
          <LoadingSpinner text="Carregando opções" />
        </div>
      ) : null}

      {!loading
        ? (field.options || []).map((option) => {
            const checked = selected.includes(option.value);
            return (
              <label key={option.value} className="flex items-start gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleOption(option.value)}
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span>
                  <span className="font-semibold text-slate-100">{option.label}</span>
                  {option.description ? (
                    <span className="block text-xs text-slate-400">{option.description}</span>
                  ) : null}
                </span>
              </label>
            );
          })
        : null}

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-200"
            >
              {item}
              <button
                type="button"
                onClick={() => toggleOption(item)}
                className="text-slate-400 hover:text-red-400"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {field.suggestions?.length ? (
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          {field.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestion(suggestion)}
              className="rounded-lg border border-slate-700/60 px-2 py-1 text-xs text-slate-200 hover:border-emerald-400/60 hover:text-emerald-200"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      {field.allowCustomOptions ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customValue}
            onChange={(event) => setCustomValue(event.target.value)}
            onKeyDown={handleCustomKeyDown}
            placeholder="Novo marcador"
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <button
            type="button"
            onClick={addCustomOption}
            className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 shadow hover:bg-emerald-400"
          >
            Adicionar
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ObjectField({ field, value, onChange }) {
  const current = value && typeof value === 'object' ? value : {};

  const handleChange = (key, newValue) => {
    const next = { ...current, [key]: newValue };
    onChange(next);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
      {(field.fields || []).map((subField) => (
        <div key={subField.name} className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {subField.label}
            {subField.required ? <span className="ml-1 text-red-400">*</span> : null}
          </span>
          <FieldInput
            field={{ ...subField, name: `${field.name}.${subField.name}` }}
            value={current[subField.name] ?? getDefaultValue(subField)}
            onChange={(val) => handleChange(subField.name, val)}
            nested
          />
          {subField.helperText ? (
            <p className="text-[0.7rem] text-slate-500">{subField.helperText}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function AbilitiesField({ field, value, onChange }) {
  const skillKeys = getSkillKeys(field);
  const kindOptions = (field.kindOptions || [
    { value: 'damage', label: 'Dano' },
    { value: 'heal', label: 'Cura' },
    { value: 'buff', label: 'Buff' },
    { value: 'debuff', label: 'Debuff' },
    { value: 'support', label: 'Suporte' },
    { value: 'utility', label: 'Utilitário' },
    { value: 'stun', label: 'Atordoamento' },
  ]).map((option) =>
    typeof option === 'string'
      ? { value: option, label: option }
      : option
  );

  const normalized = useMemo(() => normalizeAbilitiesValue(field, value), [field, value]);

  const updateSkill = useCallback(
    (abilityKey, property, newValue) => {
      onChange({
        ...normalized,
        [abilityKey]: {
          ...normalized[abilityKey],
          [property]: newValue,
        },
      });
    },
    [normalized, onChange]
  );

  const resetSkill = useCallback(
    (abilityKey) => {
      const defaults = buildDefaultAbilities(field);
      onChange({
        ...normalized,
        [abilityKey]: defaults[abilityKey],
      });
    },
    [field, normalized, onChange]
  );

  const renderNumberInput = (abilityKey, property, label) => {
    const numericValue = normalized[abilityKey]?.[property];
    return (
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
        <input
          type="number"
          value={numericValue === '' || numericValue === null || numericValue === undefined ? '' : numericValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            updateSkill(abilityKey, property, nextValue === '' ? '' : Number(nextValue));
          }}
          className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
      </div>
    );
  };

  const renderSkillCard = (abilityKey, index) => {
    const skill = normalized[abilityKey] || {};
    const title = field.skillLabels?.[abilityKey] || `Habilidade ${index + 1}`;

    return (
      <div key={abilityKey} className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">{title}</h4>
            <p className="text-xs text-slate-500">Preencha os detalhes da habilidade. Campos vazios serão ignorados.</p>
          </div>
          <button
            type="button"
            onClick={() => resetSkill(abilityKey)}
            className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-emerald-400/60 hover:text-emerald-200"
          >
            Limpar
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nome</span>
            <input
              type="text"
              value={skill.name ?? ''}
              onChange={(event) => updateSkill(abilityKey, 'name', event.target.value)}
              placeholder="Nome da habilidade"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tipo</span>
            <select
              value={skill.kind ?? ''}
              onChange={(event) => updateSkill(abilityKey, 'kind', event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="">Selecione</option>
              {kindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {renderNumberInput(abilityKey, 'base', 'Base')}
          {renderNumberInput(abilityKey, 'cost', 'Custo')}
          {renderNumberInput(abilityKey, 'ppMax', 'PP Máx.')}
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Descrição</span>
          <textarea
            rows={3}
            value={skill.description ?? ''}
            onChange={(event) => updateSkill(abilityKey, 'description', event.target.value)}
            placeholder="Explique o efeito da habilidade"
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
      </div>
    );
  };

  const renderPassive = () => {
    if (field.includePassive === false || !normalized.passive) {
      return null;
    }

    const passive = normalized.passive;

    return (
      <div className="space-y-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-amber-200">Habilidade Passiva</h4>
            <p className="text-xs text-amber-200/80">Opcional. Se preenchida, será armazenada como <code>passive</code>.</p>
          </div>
          <button
            type="button"
            onClick={() => resetSkill('passive')}
            className="rounded-lg border border-amber-400/60 px-3 py-1 text-xs font-semibold text-amber-100 transition hover:border-amber-300 hover:text-amber-50"
          >
            Limpar
          </button>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-200">Nome</span>
          <input
            type="text"
            value={passive.name ?? ''}
            onChange={(event) => updateSkill('passive', 'name', event.target.value)}
            placeholder="Nome da passiva"
            className="w-full rounded-xl border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-50 placeholder:text-amber-200/60 focus:border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-200/40"
          />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-amber-200">Descrição</span>
          <textarea
            rows={3}
            value={passive.description ?? ''}
            onChange={(event) => updateSkill('passive', 'description', event.target.value)}
            placeholder="Explique o efeito passivo"
            className="w-full rounded-xl border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-50 placeholder:text-amber-200/60 focus:border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-200/40"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {skillKeys.map((abilityKey, index) => renderSkillCard(abilityKey, index))}
      {renderPassive()}
    </div>
  );
}

export default function CrudSection({ config }) {
  const {
    id: sectionId,
    label,
    description,
    apiPath,
    responseKey,
    parseResponse: parseResponseFromConfig,
    primaryKey = 'id',
    columns = [],
    formFields = [],
    mapItemToForm,
    transformBeforeSubmit,
    buildCreateBody,
    buildUpdateBody,
    deleteParam,
    toolbar,
    emptyState,
    handleSideEffects,
    loadItemDetails,
  } = config;

  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState('create');
  const [pending, setPending] = useState(false);
  const [formValues, setFormValues] = useState(() => buildDefaultValuesFromFields(formFields));
  const [selectedItem, setSelectedItem] = useState(null);
  const [alert, setAlert] = useState(null);
  const [fieldOptions, setFieldOptions] = useState({});
  const [fieldOptionsLoading, setFieldOptionsLoading] = useState({});
  const [panelLoading, setPanelLoading] = useState(false);

  const effectiveDeleteParam = deleteParam || primaryKey;
  const fetchKeyRef = useRef('');

  const parseResponse = useMemo(() => {
    if (typeof parseResponseFromConfig === 'function') {
      return parseResponseFromConfig;
    }
    return (json) => defaultParseResponse(json, responseKey);
  }, [parseResponseFromConfig, responseKey]);

  const normalizeForForm = useCallback(
    (item) => {
      const source = mapItemToForm ? mapItemToForm(item) : item;
      const values = {};
      formFields.forEach((field) => {
        const raw = source?.[field.name];
        values[field.name] = formatFieldValue(field, raw, source);
      });
      return values;
    },
    [formFields, mapItemToForm]
  );

  const defaultValues = useMemo(() => buildDefaultValuesFromFields(formFields), [formFields]);

  const createInitialFormValues = useCallback(() => JSON.parse(JSON.stringify(defaultValues)), [defaultValues]);

  const dynamicOptionFields = useMemo(
    () => formFields.filter((field) => typeof field.optionsFetcher === 'function'),
    [formFields]
  );

  const loadDynamicOptions = useCallback(async () => {
    if (!dynamicOptionFields.length) return;

    setFieldOptionsLoading((prev) => {
      const next = { ...prev };
      dynamicOptionFields.forEach((field) => {
        next[field.name] = true;
      });
      return next;
    });

    const entries = await Promise.all(
      dynamicOptionFields.map(async (field) => {
        try {
          const options = await field.optionsFetcher();
          return [field.name, Array.isArray(options) ? options : []];
        } catch (err) {
          console.error(`[${label}] erro ao carregar opções para "${field.name}"`, err);
          return [field.name, field.options || []];
        }
      })
    );

    setFieldOptions((prev) => ({ ...prev, ...Object.fromEntries(entries) }));

    setFieldOptionsLoading((prev) => {
      const next = { ...prev };
      dynamicOptionFields.forEach((field) => {
        next[field.name] = false;
      });
      return next;
    });
  }, [dynamicOptionFields, label]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiPath, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || 'Erro ao carregar dados');
      }
      const data = parseResponse(json);
      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      console.error(`[${label}] erro ao carregar`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiPath, label, parseResponse]);

  const fetchKey = useMemo(() => {
    const parserKey = parseResponseFromConfig ? 'custom' : 'default';
    return `${sectionId}|${apiPath}|${parserKey}`;
  }, [apiPath, parseResponseFromConfig, sectionId]);

  useEffect(() => {
    if (fetchKeyRef.current === fetchKey) return;
    fetchKeyRef.current = fetchKey;
    fetchItems();
  }, [fetchItems, fetchKey]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    loadDynamicOptions();
  }, [loadDynamicOptions]);

  useEffect(() => {
    if (!search) {
      setFilteredItems(items);
      return;
    }
    const lower = search.toLowerCase();
    const filtered = items.filter((item) => {
      return columns.some((col) => {
        const value = item[col.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lower);
      });
    });
    setFilteredItems(filtered);
  }, [columns, items, search]);

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => {
      setSelectedItem(null);
      setFormValues(createInitialFormValues());
      setAlert(null);
      setPanelLoading(false);
    }, 200);
  };

  const openCreatePanel = () => {
    setPanelMode('create');
    setSelectedItem(null);
    setAlert(null);
    setPanelLoading(false);
    setFormValues(createInitialFormValues());
    setPanelOpen(true);
  };

  const openEditPanel = useCallback(
    async (item) => {
      setPanelMode('edit');
      setSelectedItem(item);
      setAlert(null);
      setPanelOpen(true);
      setFormValues(createInitialFormValues());

      const shouldLoadDetails = typeof loadItemDetails === 'function';

      if (!shouldLoadDetails) {
        setFormValues(normalizeForForm(item));
        setPanelLoading(false);
        return;
      }

      setPanelLoading(true);
      try {
        const detailedItem = await loadItemDetails(item);
        setFormValues(normalizeForForm(detailedItem || item));
      } catch (err) {
        console.error(`[${label}] erro ao carregar detalhes do registro`, err);
        setAlert({
          type: 'error',
          message: err.message || 'Não foi possível carregar dados adicionais.',
        });
        setFormValues(normalizeForForm(item));
      } finally {
        setPanelLoading(false);
      }
    },
    [createInitialFormValues, loadItemDetails, normalizeForForm, label]
  );

  const parseFieldValue = useCallback(
    (field, rawValue) => {
      if (field.parseValue) {
        return field.parseValue(rawValue);
      }

      switch (field.type) {
        case 'number':
          if (rawValue === '' || rawValue === null || rawValue === undefined) return null;
          return Number(rawValue);
        case 'boolean':
          return Boolean(rawValue);
        case 'json':
          if (!rawValue) return null;
          return JSON.parse(rawValue);
        case 'array':
        case 'tags':
          if (!rawValue) return [];
          if (Array.isArray(rawValue)) return rawValue;
          return rawValue
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        case 'list':
        case 'multi-select':
          if (!rawValue) return [];
          if (Array.isArray(rawValue)) {
            return rawValue.filter((item) => !isEmptyValue(item));
          }
          if (typeof rawValue === 'string') {
            return rawValue
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean);
          }
          return [];
        case 'object':
          if (!rawValue || typeof rawValue !== 'object') return null;
          const objectPayload = {};
          (field.fields || []).forEach((subField) => {
            const parsed = parseFieldValue(subField, rawValue[subField.name]);
            if (!isEmptyValue(parsed)) {
              objectPayload[subField.name] = parsed;
            }
          });
          return Object.keys(objectPayload).length ? objectPayload : null;
        case 'abilities': {
          if (!rawValue || typeof rawValue !== 'object') return null;
          const result = {};
          const skillFields = getSkillFields(field);
          const passiveFields = getPassiveFields(field);

          getSkillKeys(field).forEach((abilityKey) => {
            const skillSource = rawValue[abilityKey];
            if (!skillSource || typeof skillSource !== 'object') return;

            const cleanedSkill = {};
            skillFields.forEach((fieldName) => {
              if (!hasOwn(skillSource, fieldName)) return;
              const raw = skillSource[fieldName];
              if (['base', 'cost', 'ppMax'].includes(fieldName)) {
                const numeric = coerceAbilityNumber(raw);
                if (numeric !== null) {
                  cleanedSkill[fieldName] = numeric;
                }
                return;
              }

              if (typeof raw === 'string') {
                const trimmed = raw.trim();
                if (trimmed !== '') {
                  cleanedSkill[fieldName] = trimmed;
                }
                return;
              }

              if (raw !== null && raw !== undefined && raw !== '') {
                cleanedSkill[fieldName] = raw;
              }
            });

            if (Object.keys(cleanedSkill).length > 0) {
              result[abilityKey] = cleanedSkill;
            }
          });

          if (field.includePassive !== false && rawValue.passive && typeof rawValue.passive === 'object') {
            const passiveCleaned = {};
            passiveFields.forEach((fieldName) => {
              if (!hasOwn(rawValue.passive, fieldName)) return;
              const raw = rawValue.passive[fieldName];
              if (typeof raw === 'string') {
                const trimmed = raw.trim();
                if (trimmed !== '') {
                  passiveCleaned[fieldName] = trimmed;
                }
                return;
              }
              if (raw !== null && raw !== undefined && raw !== '') {
                passiveCleaned[fieldName] = raw;
              }
            });

            if (Object.keys(passiveCleaned).length > 0) {
              result.passive = passiveCleaned;
            }
          }

          return Object.keys(result).length ? result : null;
        }
        default:
          return rawValue ?? null;
      }
    },
    []
  );

  const runSubmit = async () => {
    setPending(true);
    setAlert(null);
    try {
      const cleaned = {};
      formFields.forEach((field) => {
        cleaned[field.name] = parseFieldValue(field, formValues[field.name]);
      });

      const transformed = transformBeforeSubmit ? transformBeforeSubmit(cleaned, selectedItem, panelMode) : cleaned;

      let payload = transformed ?? cleaned;
      let sideEffects = null;

      if (transformed && typeof transformed === 'object' && ('data' in transformed || 'sideEffects' in transformed)) {
        payload = transformed.data ?? cleaned;
        sideEffects = transformed.sideEffects ?? null;
      }

      const body = panelMode === 'create'
        ? (buildCreateBody ? buildCreateBody(payload) : payload)
        : (buildUpdateBody
            ? buildUpdateBody(payload, selectedItem)
            : {
                ...payload,
                [primaryKey]: selectedItem?.[primaryKey],
              });

      const method = panelMode === 'create' ? 'POST' : 'PUT';
      const request = await fetch(apiPath, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const json = await request.json();
      if (!request.ok) {
        throw new Error(json?.error || 'Falha ao salvar dados');
      }

      if (sideEffects && handleSideEffects) {
        await handleSideEffects({
          sideEffects,
          mode: panelMode,
          selectedItem,
          payload,
          response: json,
        });
      }

      setAlert({ type: 'success', message: panelMode === 'create' ? 'Registro criado com sucesso.' : 'Registro atualizado com sucesso.' });
      closePanel();
      await fetchItems();
    } catch (err) {
      console.error('Erro ao salvar registro', err);
      setAlert({ type: 'error', message: err.message || 'Falha ao salvar registro.' });
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async (item) => {
    const pkValue = item?.[primaryKey];
    if (!pkValue) {
      setAlert({ type: 'error', message: 'Registro sem identificador válido.' });
      return;
    }

    if (!window.confirm('Tem certeza que deseja remover este registro? Essa ação não pode ser desfeita.')) {
      return;
    }

    try {
      setPending(true);
      setAlert(null);
      const params = new URLSearchParams({ [effectiveDeleteParam]: pkValue });
      const response = await fetch(`${apiPath}?${params.toString()}`, { method: 'DELETE' });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || 'Falha ao excluir registro');
      }
      setAlert({ type: 'success', message: 'Registro excluído com sucesso.' });
      await fetchItems();
    } catch (err) {
      console.error('Erro ao excluir registro', err);
      setAlert({ type: 'error', message: err.message || 'Falha ao excluir registro.' });
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (panelLoading) return;
    runSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{label}</h2>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {toolbar || null}
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar..."
              className="w-64 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
          <button
            type="button"
            onClick={openCreatePanel}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            Novo registro
          </button>
        </div>
      </div>

      {alert ? (
        <div
          className={cn(
            'rounded-xl border px-4 py-3 text-sm',
            alert.type === 'error'
              ? 'border-red-500/40 bg-red-500/10 text-red-200'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
          )}
        >
          {alert.message}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner text="Carregando registros" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
          <p>Ocorreu um erro ao carregar os dados: {error}</p>
          <button
            type="button"
            onClick={fetchItems}
            className="mt-3 inline-flex items-center rounded-lg border border-red-400/60 bg-transparent px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/10"
          >
            Tentar novamente
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
  <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 p-12 text-center text-sm text-slate-400">
          {emptyState || (
            <p>
              Nenhum registro encontrado. Clique em <strong>&quot;Novo registro&quot;</strong> para adicionar um item.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900/60">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredItems.map((item) => (
                <tr key={item[primaryKey]} className="hover:bg-slate-900/70">
                  {columns.map((column) => {
                    const cellValue = column.render ? column.render(item[column.key], item) : item[column.key];
                    return (
                      <td key={column.key} className="px-4 py-3 text-sm text-slate-200">
                        {cellValue === null || cellValue === undefined || cellValue === '' ? (
                          <span className="text-slate-500">—</span>
                        ) : Array.isArray(cellValue) ? (
                          <div className="flex flex-wrap gap-2">
                            {cellValue.map((chip) => (
                              <span
                                key={chip}
                                className="inline-flex items-center rounded-lg bg-slate-800/70 px-2 py-0.5 text-xs text-slate-300"
                              >
                                {chip}
                              </span>
                            ))}
                          </div>
                        ) : typeof cellValue === 'boolean' ? (
                          <span
                            className={cn(
                              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                              cellValue
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-slate-800/70 text-slate-400'
                            )}
                          >
                            <span className="h-2 w-2 rounded-full bg-current" />
                            {cellValue ? 'Ativo' : 'Inativo'}
                          </span>
                        ) : (
                          <span className="whitespace-pre-wrap text-slate-200">{cellValue}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditPanel(item)}
                        className="rounded-lg border border-emerald-500/50 px-3 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="rounded-lg border border-red-500/50 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Side panel */}
      <div
        className={cn(
          'fixed inset-0 z-[70] overflow-hidden bg-black/40 backdrop-blur-sm transition-opacity',
          panelOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div
          className={cn(
            'absolute right-0 top-0 h-full w-full max-w-2xl transform bg-slate-950 shadow-2xl transition-transform duration-200 ease-out',
            panelOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {panelMode === 'create' ? 'Novo registro' : 'Editar registro'}
                </h3>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-full bg-slate-800/70 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                <span className="sr-only">Fechar</span>
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {panelLoading ? (
                <div className="flex h-full min-h-[220px] items-center justify-center">
                  <LoadingSpinner text="Carregando dados do registro" />
                </div>
              ) : (
                <div className="space-y-5">
                  {formFields.map((field) => {
                    const resolvedField = {
                      ...field,
                      options: fieldOptions[field.name] ?? field.options,
                      loading: fieldOptionsLoading[field.name] ?? false,
                    };
                    return (
                      <div key={field.name}>
                        <label htmlFor={field.name} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {resolvedField.label}
                          {resolvedField.required ? <span className="ml-1 text-red-400">*</span> : null}
                        </label>
                        <FieldInput
                          field={resolvedField}
                          value={formValues[field.name]}
                          loading={resolvedField.loading}
                          onChange={(newValue) =>
                            setFormValues((prev) => ({
                              ...prev,
                              [field.name]: newValue,
                            }))
                          }
                        />
                        {resolvedField.helperText ? (
                          <p className="mt-1 text-xs text-slate-500">{resolvedField.helperText}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
              <button
                type="button"
                onClick={closePanel}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800/70"
                disabled={pending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending || panelLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
              >
                {pending ? 'Salvando...' : 'Salvar mudanças'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

