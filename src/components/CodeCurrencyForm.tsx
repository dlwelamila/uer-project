"use client"

import { useMemo, useRef, type ChangeEvent } from 'react'
import { parseCsvFile } from '@/lib/csv'
import {
  mergeCodeCurrencyRows,
  mapCodeCurrencyCsvRows,
  type CodeCurrencyImportOptions,
  type CodeCurrencyRowDraft,
} from '@/lib/code-currency'

type Props = {
  value: CodeCurrencyRowDraft[]
  onChange?: (rows: CodeCurrencyRowDraft[]) => void
  disabled?: boolean
  importOptions?: CodeCurrencyImportOptions
}

const EMPTY_ROW: CodeCurrencyRowDraft = {
  systemModel: '',
  assetCount: 0,
  installedCode: '',
  statuses: {},
  minSupported7: '',
  minSupported8: '',
  recommended7: '',
  recommended8: '',
  latest7: '',
  latest8: '',
}

const STATUS_META = [
  { key: 'o', label: 'O', tone: 'bg-[#fde7e9] border-[#c62828] text-[#8b1515]' },
  { key: 'm', label: 'M', tone: 'bg-[#feecce] border-[#ef6c00] text-[#9b5300]' },
  { key: 'r', label: 'R', tone: 'bg-[#e3f2c3] border-[#7cb342] text-[#3f6d1d]' },
  { key: 'l', label: 'L', tone: 'bg-[#d5f4f7] border-[#0397a6] text-[#03626d]' },
] as const

export function CodeCurrencyForm({ value, onChange, disabled, importOptions }: Props) {
  const rows = useMemo(() => value ?? [], [value])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const updateRow = (index: number, patch: Partial<CodeCurrencyRowDraft>) => {
    if (!onChange) return
    const next = rows.map((row, idx) => (idx === index ? { ...row, ...patch } : row))
    onChange(next)
  }

  const updateStatus = (index: number, key: keyof CodeCurrencyRowDraft['statuses']) => {
    if (!onChange) return
    const current = rows[index]
    if (!current) return
    const nextStatus = { ...current.statuses, [key]: !current.statuses[key] }
    updateRow(index, { statuses: nextStatus })
  }

  const addRow = () => {
    if (!onChange) return
    onChange([
      ...rows,
      {
        ...EMPTY_ROW,
        statuses: {},
      },
    ])
  }

  const removeRow = (index: number) => {
    if (!onChange) return
    const next = rows.filter((_, idx) => idx !== index)
    onChange(next)
  }

  const handleCsvImport = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const { rows: rawRows, errors } = await parseCsvFile(file)
      if (errors?.length) {
        console.warn('CSV import reported errors', errors)
      }
      const { rows: imported, skipped, totalRows, processedRows, filtered, metadata } = mapCodeCurrencyCsvRows(
        rawRows,
        importOptions,
      )
      if (!imported.length) {
        const reasonParts: string[] = []
        if (filtered.byCustomer) {
          reasonParts.push(`${filtered.byCustomer} row(s) filtered by the selected customer`)
        }
        if (skipped) {
          reasonParts.push(`${skipped} row(s) missing a product name`)
        }
        const reasonText = reasonParts.length ? ` (${reasonParts.join('; ')})` : ''
        window.alert(
          `No matching product rows were detected in the CSV after applying the selected filters${reasonText}.`,
        )
        return
      }

      const shouldReplace =
        !rows.length || window.confirm('Replace existing Code Currency entries with the imported data?')
      const nextRows = shouldReplace ? imported : mergeCodeCurrencyRows(rows, imported)
      onChange(nextRows)
      if (skipped) {
        console.info(`Code Currency import skipped ${skipped} row(s) without a recognised product name.`)
      }
      if (filtered.byCustomer) {
        console.info('Code currency import applied customer filtering', filtered)
      }
      console.debug('Code currency import data', {
        totalRows,
        processedRows,
        filtered,
        skipped,
        metadata,
      })
    } catch (error) {
      console.error('Failed to import Code Currency CSV', error)
      window.alert('Unable to import CSV. Confirm the file matches the Dell export format and try again.')
    }
  }

  const renderInput = (
    index: number,
    field: keyof CodeCurrencyRowDraft,
    options?: {
      type?: 'text' | 'number'
      placeholder?: string
      multiline?: boolean
      className?: string
    },
  ) => {
    if (!onChange) return null
    const { type = 'text', placeholder, multiline, className } = options ?? {}
    const value = rows[index]?.[field]
    if (multiline) {
      return (
        <textarea
          className={`h-20 w-full rounded border border-slate-300 px-2 py-1 text-sm ${className ?? ''}`}
          value={String(value ?? '')}
          onChange={(event) =>
            updateRow(index, { [field]: event.target.value } as Partial<CodeCurrencyRowDraft>)
          }
          placeholder={placeholder}
          disabled={disabled}
        />
      )
    }
    return (
      <input
        type={type}
        className={`w-full rounded border border-slate-300 px-2 py-1 text-sm ${className ?? ''}`}
        value={type === 'number' ? Number(value ?? 0) : String(value ?? '')}
        onChange={(event) => {
          const nextValue =
            type === 'number' ? Number(event.target.value ?? 0) : (event.target.value as string)
          updateRow(index, { [field]: nextValue } as Partial<CodeCurrencyRowDraft>)
        }}
        placeholder={placeholder}
        disabled={disabled}
        min={type === 'number' ? 0 : undefined}
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#123c73]">Captured Products</h3>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvImport}
            className="hidden"
          />
          <button
            type="button"
            className="inline-flex items-center rounded border border-[#03626d] px-3 py-1 text-xs font-semibold text-[#03626d] transition hover:bg-[#03626d]/10 disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            Import CSV
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded border border-[#0d5cad] px-3 py-1 text-xs font-semibold text-[#0d5cad] transition hover:bg-[#0d5cad]/10 disabled:opacity-50"
            onClick={addRow}
            disabled={disabled}
          >
            + Add product
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <table className="min-w-[1180px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-[#4a5d7a]">
              <th className="w-[18rem] px-3 py-2 text-left">System Model</th>
              <th className="w-32 px-3 py-2 text-center">Asset Count #</th>
              <th className="w-[20rem] px-3 py-2 text-left">Installed Code</th>
              {STATUS_META.map((meta) => (
                <th key={meta.key} className="w-12 px-2 py-2 text-center">
                  {meta.label}
                </th>
              ))}
              <th className="w-48 px-3 py-2 text-left">Minimum 7.0.x</th>
              <th className="w-48 px-3 py-2 text-left">Minimum 8.0.x</th>
              <th className="w-48 px-3 py-2 text-left">Recommended 7.0.x</th>
              <th className="w-48 px-3 py-2 text-left">Recommended 8.0.x</th>
              <th className="w-48 px-3 py-2 text-left">Latest 7.0.x</th>
              <th className="w-48 px-3 py-2 text-left">Latest 8.0.x</th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {!rows.length && (
              <tr>
                <td colSpan={12} className="rounded bg-[#f5f8ff] px-3 py-4 text-center text-xs text-[#4a5d7a]">
                  No products captured yet. Use &quot;Add Product&quot; to begin.
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={row.id ?? `row-${index}`} className="rounded border border-[#d5dbe6] bg-white shadow-sm">
                <td className="w-[18rem] px-3 py-2 align-top">
                  {renderInput(index, 'systemModel', {
                    placeholder: 'Model name',
                    className: 'min-w-[12rem]',
                  })}
                </td>
                <td className="w-32 px-3 py-2 align-top">
                  {renderInput(index, 'assetCount', {
                    type: 'number',
                    placeholder: '0',
                    className: 'min-w-[5rem] text-center',
                  })}
                </td>
                <td className="w-[20rem] px-3 py-2 align-top">
                  {renderInput(index, 'installedCode', {
                    multiline: true,
                    placeholder: 'Installed firmware details',
                    className: 'min-w-[18rem]',
                  })}
                </td>
                {STATUS_META.map((meta) => (
                  <td key={meta.key} className="px-2 py-2 text-center align-top">
                    <button
                      type="button"
                      className={`inline-flex h-7 w-7 items-center justify-center rounded border text-xs font-semibold transition ${
                        row.statuses[meta.key] ? meta.tone : 'border-slate-300 text-slate-400'
                      } ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:scale-105'}`}
                      onClick={() => updateStatus(index, meta.key)}
                      disabled={disabled}
                    >
                      {meta.label}
                    </button>
                  </td>
                ))}
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'minSupported7', { placeholder: 'e.g., 8.2.3d' })}
                </td>
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'minSupported8', { placeholder: '-' })}
                </td>
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'recommended7', { placeholder: 'e.g., 7.0.532' })}
                </td>
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'recommended8', { placeholder: 'e.g., 8.0.311' })}
                </td>
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'latest7', { placeholder: 'e.g., 7.0.532' })}
                </td>
                <td className="px-3 py-2 align-top">
                  {renderInput(index, 'latest8', { placeholder: 'e.g., 8.0.311' })}
                </td>
                <td className="px-3 py-2 align-top text-center">
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#c62828] hover:text-[#8b1515] disabled:opacity-40"
                    onClick={() => removeRow(index)}
                    disabled={disabled}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
