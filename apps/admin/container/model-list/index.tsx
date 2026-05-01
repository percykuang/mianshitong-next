'use client'

import { useState } from 'react'

import { Button, Plus, Table, useAppInstance } from '@mianshitong/ui'
import { useRouter } from 'next/navigation'

import type { AdminChatModelListResult } from '@/server/model'
import type { AdminChatModelUpsertPayload } from '@/shared/model-dto'
import { Title } from '@/ui'

import {
  ModelConfigEditorModal,
  type ModelConfigEditorState,
  type ModelEditorValues,
} from './model-config-editor-modal'
import { useModelListColumns } from './use-model-list-columns'

type AdminChatModelItem = AdminChatModelListResult['items'][number]

function createEmptyEditorValues(): ModelEditorValues {
  return {
    id: '',
    label: '',
    description: '',
    provider: 'deepseek',
    baseUrl: '',
    apiKey: '',
    model: '',
    enabled: true,
    isDefault: false,
    sortOrder: '0',
    supportsJsonOutput: true,
    modelKwargsJson: '',
    jsonModelKwargsJson: '',
  }
}

function toEditorValues(model: AdminChatModelItem): ModelEditorValues {
  return {
    id: model.id,
    label: model.label,
    description: model.description,
    provider: model.provider,
    baseUrl: model.baseUrl,
    apiKey: '',
    model: model.model,
    enabled: model.enabled,
    isDefault: model.isDefault,
    sortOrder: String(model.sortOrder),
    supportsJsonOutput: model.supportsJsonOutput,
    modelKwargsJson: model.modelKwargsJson,
    jsonModelKwargsJson: model.jsonModelKwargsJson,
  }
}

function buildRequestBody(
  values: ModelEditorValues
): AdminChatModelUpsertPayload {
  return {
    id: values.id,
    label: values.label,
    description: values.description,
    provider: values.provider,
    baseUrl: values.baseUrl,
    apiKey: values.apiKey,
    model: values.model,
    enabled: values.enabled,
    isDefault: values.isDefault,
    sortOrder: Number(values.sortOrder),
    supportsJsonOutput: values.supportsJsonOutput,
    modelKwargsJson: values.modelKwargsJson,
    jsonModelKwargsJson: values.jsonModelKwargsJson,
  }
}

export function ModelList({ models }: { models: AdminChatModelListResult }) {
  const router = useRouter()
  const { message } = useAppInstance()
  const [editor, setEditor] = useState<ModelConfigEditorState | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreateEditor = () => {
    setEditor({
      mode: 'create',
      error: '',
      values: createEmptyEditorValues(),
    })
  }

  const openEditEditor = (model: AdminChatModelItem) => {
    setEditor({
      mode: 'edit',
      error: '',
      apiKeyPreview: model.apiKeyPreview,
      values: toEditorValues(model),
    })
  }

  const closeEditor = () => {
    if (saving) {
      return
    }

    setEditor(null)
  }

  const updateEditorValue = <K extends keyof ModelEditorValues>(
    key: K,
    value: ModelEditorValues[K]
  ) => {
    setEditor((currentValue) =>
      currentValue
        ? {
            ...currentValue,
            error: '',
            values: {
              ...currentValue.values,
              [key]: value,
            },
          }
        : currentValue
    )
  }

  const handleSaveModel = async () => {
    if (!editor) {
      return
    }

    if (!Number.isSafeInteger(Number(editor.values.sortOrder))) {
      setEditor({
        ...editor,
        error: '排序必须是整数',
      })
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        editor.mode === 'create'
          ? '/api/models'
          : `/api/models/${editor.values.id}`,
        {
          method: editor.mode === 'create' ? 'POST' : 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buildRequestBody(editor.values)),
        }
      )

      const payload = (await response.json().catch(() => null)) as {
        error?: string
      } | null

      if (!response.ok) {
        const errorMessage = payload?.error ?? '保存模型配置失败，请稍后重试'

        setEditor({
          ...editor,
          error: errorMessage,
        })
        return
      }

      message.success(editor.mode === 'create' ? '模型已创建' : '模型已更新')
      setEditor(null)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const { columns } = useModelListColumns({
    onEditModel: openEditEditor,
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Title>模型配置</Title>
        <Button
          icon={<Plus className="size-4" />}
          onClick={openCreateEditor}
          variant="primary"
        >
          新增模型
        </Button>
      </div>

      <Table<AdminChatModelItem>
        bordered
        columns={columns}
        dataSource={models.items}
        locale={{
          emptyText: '当前还没有可用模型，请先新增并启用至少一个模型配置。',
        }}
        pagination={false}
        rowKey="id"
        scroll={{ x: 'max-content' }}
      />

      <ModelConfigEditorModal
        editor={editor}
        onCancel={closeEditor}
        onConfirm={() => void handleSaveModel()}
        onValueChange={updateEditorValue}
        saving={saving}
      />
    </div>
  )
}
