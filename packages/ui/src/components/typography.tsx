'use client'

import { Typography as AntTypography } from 'antd'
import type { ParagraphProps as AntParagraphProps } from 'antd/es/typography/Paragraph'
import type { TextProps as AntTextProps } from 'antd/es/typography/Text'
import type { TitleProps as AntTitleProps } from 'antd/es/typography/Title'

export type TypographyTextProps = AntTextProps
export type TypographyTitleProps = AntTitleProps
export type TypographyParagraphProps = AntParagraphProps

export function TypographyText(props: TypographyTextProps) {
  return <AntTypography.Text {...props} />
}

export function TypographyTitle(props: TypographyTitleProps) {
  return <AntTypography.Title {...props} />
}

export function TypographyParagraph(props: TypographyParagraphProps) {
  return <AntTypography.Paragraph {...props} />
}
