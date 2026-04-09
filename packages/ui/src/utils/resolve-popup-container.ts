const popupContainerId = 'mst-ui-popup-container'

export function resolvePopupContainer(triggerNode?: HTMLElement) {
  if (!triggerNode) {
    return document.body
  }

  const rootNode = triggerNode.getRootNode()

  if (rootNode instanceof ShadowRoot) {
    const existingContainer = rootNode.getElementById(popupContainerId)

    if (existingContainer) {
      return existingContainer
    }

    const container = document.createElement('div')
    container.id = popupContainerId
    rootNode.appendChild(container)

    return container
  }

  return triggerNode.ownerDocument.body
}
