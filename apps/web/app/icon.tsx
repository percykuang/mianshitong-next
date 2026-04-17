import {
  getMianshitongAppIconSvg,
  MIANSHITONG_APP_ICON_CONTENT_TYPE,
  MIANSHITONG_APP_ICON_SIZE,
} from '@mianshitong/icons'

export const size = MIANSHITONG_APP_ICON_SIZE

export const contentType = MIANSHITONG_APP_ICON_CONTENT_TYPE

export default function Icon() {
  return new Response(getMianshitongAppIconSvg(), {
    headers: {
      'Content-Type': contentType,
    },
  })
}
