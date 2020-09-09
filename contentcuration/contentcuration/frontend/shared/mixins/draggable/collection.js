import { mapActions, mapGetters, mapState } from 'vuex';
import containerMixin from './container';
import { DraggableTypes } from 'shared/mixins/draggable/constants';

export default {
  mixins: [containerMixin],
  inject: {
    draggableUniverse: { default: null },
    draggableRegionId: { default: null },
  },
  provide() {
    return {
      draggableCollectionId: this.draggableId,
    };
  },
  data() {
    return {
      draggableType: DraggableTypes.COLLECTION,
    };
  },
  computed: {
    ...mapState('draggable/collections', [
      'activeDraggableId',
      'hoverDraggableId',
      'hoverDraggableSection',
    ]),
    ...mapGetters('draggable/collections', ['draggingTargetSection']),
    hasDescendantHoverDraggable() {
      return this.hoverDraggableId === this.draggableId && this.hoverDraggableItemId;
    },
  },
  watch: {
    hoverDraggableRegionId(id) {
      if (id && this.draggableRegionId && id !== this.draggableRegionId) {
        this.debouncedEmitDraggableDragLeave();
      }
    },
  },
  methods: {
    ...mapActions('draggable/collections', [
      'setHoverDraggable',
      'updateHoverDraggable',
      'resetHoverDraggable',
      'setActiveDraggableSize',
    ]),
  },
};