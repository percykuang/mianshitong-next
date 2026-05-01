'use client'

import {
  Button,
  FormField,
  Input,
  Modal,
  Select,
  Textarea,
} from '@mianshitong/ui'

import type {
  AdminChatModelProvider,
  AdminChatModelUpsertPayload,
} from '@/shared/model-dto'

interface ModelEditorValues extends Omit<
  AdminChatModelUpsertPayload,
  'sortOrder'
> {
  apiKey: string
  sortOrder: string
}

interface ModelConfigEditorState {
  error: string
  mode: 'create' | 'edit'
  values: ModelEditorValues
  apiKeyPreview?: string
}

interface ModelConfigEditorModalProps {
  editor: ModelConfigEditorState | null
  onCancel: () => void
  onConfirm: () => void
  onValueChange: <K extends keyof ModelEditorValues>(
    key: K,
    value: ModelEditorValues[K]
  ) => void
  saving: boolean
}

const BOOLEAN_OPTIONS = [
  { label: '是', value: 'true' },
  { label: '否', value: 'false' },
]

const PROVIDER_OPTIONS = [
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'Ollama', value: 'ollama' },
  { label: 'OpenAI Compatible', value: 'openai-compatible' },
]

export function ModelConfigEditorModal({
  editor,
  onCancel,
  onConfirm,
  onValueChange,
  saving,
}: ModelConfigEditorModalProps) {
  if (!editor) {
    return null
  }

  const { values } = editor

  return (
    <Modal
      centered
      confirmLoading={saving}
      destroyOnHidden
      footer={null}
      onCancel={onCancel}
      onOk={onConfirm}
      open
      title={editor.mode === 'create' ? '新增模型配置' : '编辑模型配置'}
      width={860}
    >
      <div className="grid gap-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="模型 ID">
            <Input
              disabled={editor.mode === 'edit'}
              onChange={(event) => onValueChange('id', event.target.value)}
              placeholder="例如 deepseek-v4-pro"
              value={values.id}
            />
          </FormField>
          <FormField label="显示名称">
            <Input
              onChange={(event) => onValueChange('label', event.target.value)}
              placeholder="例如 DeepSeek V4 Pro"
              value={values.label}
            />
          </FormField>
        </div>

        <FormField label="描述">
          <Input
            onChange={(event) =>
              onValueChange('description', event.target.value)
            }
            placeholder="展示在前端模型列表里的简短说明"
            value={values.description}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="提供方">
            <Select
              onChange={(value) =>
                onValueChange('provider', value as AdminChatModelProvider)
              }
              options={PROVIDER_OPTIONS}
              value={values.provider}
            />
          </FormField>
          <FormField label="模型名">
            <Input
              onChange={(event) => onValueChange('model', event.target.value)}
              placeholder="例如 deepseek-v4-pro"
              value={values.model}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Base URL">
            <Input
              onChange={(event) => onValueChange('baseUrl', event.target.value)}
              placeholder="例如 https://api.deepseek.com"
              value={values.baseUrl}
            />
          </FormField>
          <FormField
            hint={
              editor.mode === 'edit' && editor.apiKeyPreview
                ? `留空则保持当前密钥 ${editor.apiKeyPreview}`
                : undefined
            }
            label="API Key"
          >
            <Input
              onChange={(event) => onValueChange('apiKey', event.target.value)}
              placeholder={
                editor.mode === 'create' ? '请输入 API Key' : '留空则不修改'
              }
              type="password"
              value={values.apiKey}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <FormField label="启用">
            <Select
              onChange={(value) => onValueChange('enabled', value === 'true')}
              options={BOOLEAN_OPTIONS}
              value={String(values.enabled)}
            />
          </FormField>
          <FormField label="默认模型">
            <Select
              onChange={(value) => onValueChange('isDefault', value === 'true')}
              options={BOOLEAN_OPTIONS}
              value={String(values.isDefault)}
            />
          </FormField>
          <FormField label="支持 JSON Output">
            <Select
              onChange={(value) =>
                onValueChange('supportsJsonOutput', value === 'true')
              }
              options={BOOLEAN_OPTIONS}
              value={String(values.supportsJsonOutput)}
            />
          </FormField>
          <FormField label="排序">
            <Input
              onChange={(event) =>
                onValueChange('sortOrder', event.target.value)
              }
              placeholder="0"
              value={values.sortOrder}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField hint="留空表示不传额外模型参数" label="模型参数 JSON">
            <Textarea
              onChange={(event) =>
                onValueChange('modelKwargsJson', event.target.value)
              }
              placeholder='例如 {"thinking":{"type":"enabled"}}'
              rows={7}
              value={values.modelKwargsJson}
            />
          </FormField>
          <FormField
            hint="留空时会复用模型参数 JSON"
            label="结构化输出参数 JSON"
          >
            <Textarea
              onChange={(event) =>
                onValueChange('jsonModelKwargsJson', event.target.value)
              }
              placeholder='例如 {"thinking":{"type":"disabled"}}'
              rows={7}
              value={values.jsonModelKwargsJson}
            />
          </FormField>
        </div>

        {editor.error ? (
          <div className="rounded-md border border-(--mst-color-danger) bg-[rgb(255_77_79/0.06)] px-3 py-2 text-sm text-(--mst-color-danger)">
            {editor.error}
          </div>
        ) : null}

        <div className="flex justify-end gap-3">
          <Button onClick={onCancel} variant="secondary">
            取消
          </Button>
          <Button loading={saving} onClick={onConfirm} variant="primary">
            保存
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export type { ModelConfigEditorState, ModelEditorValues }
