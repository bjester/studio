import { mapActions, mapState } from 'vuex';
import baseMixin from './base';
import { DraggableTypes } from './constants';
import { extendAndRender } from 'shared/utils';

export default {
  mixins: [baseMixin],
  inject: {
    draggableUniverse: { default: null },
    draggableRegionId: { default: null },
    draggableCollectionId: { default: null },
    draggableItemId: { default: null },
  },
  props: {
    draggable: {
      type: Boolean,
      default() {
        return !!(this.draggableUniverse && this.draggableRegionId);
      },
    },
    grouped: {
      type: Boolean,
      default: false,
    },
    effectsAllowed: {
      type: String,
      default: 'move copy',
    },
  },
  data() {
    return {
      draggableType: DraggableTypes.HANDLE,
    };
  },
  computed: {
    ...mapState('draggable/handles', ['activeDraggableId']),
    isDragging() {
      return this.draggableId === this.activeDraggableId;
    },
    draggableIdentity() {
      return {
        id: this.draggableId,
        universe: this.draggableUniverse,
        regionId: this.draggableRegionId,
        collectionId: this.draggableCollectionId,
        itemId: this.draggableItemId,
      };
    },
  },
  watch: {
    grouped(isGrouped) {
      // Watch group status to add this handle to the grouped handles
      if (isGrouped) {
        this.addGroupedDraggableHandle(this.draggableIdentity);
      } else {
        this.removeGroupedDraggableHandle(this.draggableIdentity);
      }
    },
  },
  methods: {
    ...mapActions('draggable', [
      'updateDraggableDirection',
      'resetDraggableDirection',
      'addGroupedDraggableHandle',
      'removeGroupedDraggableHandle',
    ]),
    ...mapActions('draggable/handles', ['setActiveDraggable', 'resetActiveDraggable']),
    /**
     * @param {DragEvent} e
     */
    emitDraggableDragStart(e) {
      // If draggability(TM) isn't enabled then we shouldn't trigger any dragging events!
      if (!this.draggable) {
        e.preventDefault();
        return;
      }

      // Set draggable image
      const dragImage = new Image();
      dragImage.src =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBgDTD2qgAAAAASUVORK5CYII=';
      e.dataTransfer.setDragImage(dragImage, 1, 1);
      e.dataTransfer.setData('draggableIdentity', JSON.stringify(this.draggableIdentity));

      this.emitDraggableDrag(e);
      this.setActiveDraggable(this.draggableIdentity);
    },
    /**
     * @param {DragEvent} e
     */
    emitDraggableDrag(e) {
      const { screenX, screenY } = e;

      // Firefox doesn't like us
      if (!screenX && !screenY) {
        return;
      }

      this.updateDraggableDirection({
        x: screenX,
        y: screenY,
      });
    },
    emitDraggableDragEnd() {
      this.resetDraggableDirection();
      this.$nextTick(() => this.resetActiveDraggable());
    },
    extendAndRender,
  },
  render() {
    const { isDragging, draggable } = this;

    return this.extendAndRender(
      'default',
      {
        class: {
          'in-draggable-universe': this.isInActiveDraggableUniverse,
          'is-dragging': isDragging,
        },
        attrs: {
          draggable: String(this.draggable),
          'aria-grabbed': String(isDragging),
        },
        on: {
          dragstart: e => this.emitDraggableDragStart(e),
          // Ideally and according to the API spec, we should be able to use this
          // for tracking mouse position, but Firefox doesn't like us...
          // drag: animationThrottle(e => this.emitDraggableDrag(e)),
          dragend: e => this.emitDraggableDragEnd(e),
        },
      },
      { isDragging, draggable }
    );
  },
};