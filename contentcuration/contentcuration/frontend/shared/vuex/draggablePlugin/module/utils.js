import isMatch from 'lodash/isMatch';
import { DraggableFlags } from './constants';
import { DraggableSearchOrder, DraggableTypes } from 'shared/mixins/draggable/constants';
import { CLIENTID } from 'shared/data/db';

/**
 * Helper with getters to grab different draggable ancestor types based
 * on an identity object, which contains ID's and ancestor data
 */
export class DraggableIdentityHelper {
  /**
   * @param {DraggableIdentity|Object} identity
   */
  constructor(identity) {
    this._identity = identity;
    this._ancestors = (identity.ancestors || []).slice().reverse();
  }

  is({ id, type, universe }) {
    return isMatch(this._identity, { id, type, universe });
  }

  findClosestAncestor(matcher) {
    const { id, type } = this._identity;
    return this._ancestors.find(a => isMatch(a, matcher) && !isMatch(a, { id, type }));
  }

  get ancestorsInOrder() {
    return DraggableSearchOrder.map(type => this.findClosestAncestor({ type })).filter(Boolean);
  }

  get key() {
    const { universe, type, id } = this._identity;
    return `${universe}/${type}/${id}`;
  }

  get region() {
    return this.findClosestAncestor({ type: DraggableTypes.REGION });
  }

  get collection() {
    return this.findClosestAncestor({ type: DraggableTypes.COLLECTION });
  }

  get item() {
    return this.findClosestAncestor({ type: DraggableTypes.ITEM });
  }
}

export class DragEventHelper {
  /**
   * @param {DragEvent} event
   * @param {Object} [data]
   */
  constructor(event, data = null) {
    this.event = event;
    this.data = data;
    this.identity = null;
    this.clientId = null;
    this.effectAllowed = null;
  }

  /**
   * @param {DragEvent} e
   * @return {DragEventHelper}
   */
  static fromEvent(e) {
    const helper = new DragEventHelper(e);
    if (helper.isDraggable) {
      const { clientId, identity, effectAllowed } = JSON.parse(e.dataTransfer.getData('draggable'));
      helper.clientId = clientId;
      helper.identity = identity;
      helper.effectAllowed = effectAllowed;
    }
    return helper;
  }

  /**
   * @param {DragEvent} e
   * @param {DraggableIdentity} identity
   * @param {String} effectAllowed
   * @return {DragEventHelper}
   */
  static initEvent(e, identity, effectAllowed) {
    // Set draggable image to transparent 1x1 pixel image, overriding default browser behavior
    // that generates a static PNG from the element
    const dragImage = new Image();
    dragImage.src =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=';
    e.dataTransfer.setDragImage(dragImage, 1, 1);
    e.dataTransfer.effectAllowed = effectAllowed;
    e.dataTransfer.setData(
      'draggable',
      JSON.stringify({
        clientId: CLIENTID,
        identity,
        effectAllowed,
      })
    );

    const helper = new DragEventHelper(e);
    helper.clientId = CLIENTID;
    helper.identity = identity;
    return helper;
  }

  get isDraggable() {
    return this.event.dataTransfer && this.event.dataTransfer.types.find(t => t === 'draggable');
  }

  get fromAnotherClient() {
    return this.clientId !== CLIENTID;
  }
}

/**
 * Helper that turns a draggable flags bitmask into an object with each
 * booleans for each direction
 *
 * @param {Number} mask
 * @returns {{top: bool, left: bool, bottom: bool, up: bool, right: bool, down: bool}}
 */
export function bitMaskToObject(mask) {
  return {
    top: Boolean(mask & DraggableFlags.TOP),
    up: Boolean(mask & DraggableFlags.UP),
    bottom: Boolean(mask & DraggableFlags.BOTTOM),
    down: Boolean(mask & DraggableFlags.DOWN),
    left: Boolean(mask & DraggableFlags.LEFT),
    right: Boolean(mask & DraggableFlags.RIGHT),
    any: mask > 0,
  };
}
