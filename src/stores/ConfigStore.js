import {defineStore} from 'pinia';

export function getDefaultPriorityObject() {
  return {
    priority: null,
    component: null,
    criteria: null,
    // ui
    isDragOver: false,
  };
}

export const useConfigStore = defineStore({
  id: 'config',
  state: () => ({
    referenceApp: null,
    isKintoneEnvironment: typeof kintone !== 'undefined',
    assignmentThresholdField: null,
    assigneeField: null,
    threshold: 0,
    priorityList: [getDefaultPriorityObject()],
    editMode: false,
    // source
    sourceAssignmentDateField: null,
    sourceDedicatedAssigneeField: null,
  }),
  getters: {
    isKintoneEnvironment() {
      return typeof kintone !== 'undefined';
    },
    thisAppId() {
      // eslint-disable-next-line no-undef
      return this.isKintoneEnvironment ? kintone.app.getId() : 5;
    },
    formReadOnly(state) {
      return !state.editMode && this.hasConfig;
    },
    hasConfig(state) {
      if (state.isKintoneEnvironment) {
        // eslint-disable-next-line no-undef
        const config = kintone.plugin.app.getConfig(kintone.$PLUGIN_ID);

        return !this.isEmpty(config);
      }

      return false;
    },
    priorityListLength(state) {
      return state.priorityList.length;
    },
  },
  actions: {
    autoNumberingPriorityList() {
      this.priorityList = this.priorityList.map((priority, index) => ({
        ...priority,
        priority: index + 1,
      }));
    },
    isEmpty(obj) {
      for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
          return false;
        }
      }

      return true;
    },
    addList() {
      const defaultObj = getDefaultPriorityObject();

      defaultObj.criteria = {
        label: 'High to low',
        criteria: 'htl',
      };
      this.priorityList.push(defaultObj);
    },
    removeList(index) {
      if (this.priorityList.length === 1) {
        alert('Cannot remove the last mapper');

        return;
      }

      this.priorityList.splice(index, 1);
    },
    async saveConfig() {
      if (!this.referenceApp?.appId) {
        alert('Please select the reference app');
        return;
      }

      if (!this.assignmentThresholdField?.code) {
        alert('Please select the assignment threshold field');
        return;
      }

      if (!this.threshold) {
        alert('Please set the threshold');
        return;
      }

      if (!this.priorityList.every((priority) => priority.component)) {
        alert('Please select the component for each priority');
        return;
      }

      if (!this.priorityList.every((priority) => priority.criteria)) {
        alert('Please select the criteria for each priority');
        return;
      }

      if (!this.assigneeField?.code) {
        alert('Please select the assignee field');
        return;
      }

      if (!this.sourceAssignmentDateField?.code) {
        alert('Please select the source assignment date field');
        return;
      }

      const config = {
        priorityList: JSON.stringify(this.priorityList),
        referenceApp: JSON.stringify(this.referenceApp),
        assignmentThresholdField: JSON.stringify(this.assignmentThresholdField),
        assigneeField: JSON.stringify(this.assigneeField),
        threshold: this.threshold.toString(),
        sourceAssignmentDateField: JSON.stringify(this.sourceAssignmentDateField),
        sourceDedicatedAssigneeField: JSON.stringify(this.sourceDedicatedAssigneeField),
      };

      if (this.isKintoneEnvironment) {
        // eslint-disable-next-line no-undef
        await kintone.plugin.app.setConfig(config);
      }
    },
    setReferenceApp(app) {
      this.referenceApp = app;
    },
    setPriorityList(newList) {
      this.priorityList = [];
      this.priorityList = [...newList];
    },
    setAssignmentThresholdField(field) {
      this.assignmentThresholdField = field;
    },
    setAssigneeField(field) {
      this.assigneeField = field;
    },
    setThreshold(threshold) {
      this.threshold = threshold;
    },
    setSourceAssignmentDateField(field) {
      this.sourceAssignmentDateField = field;
    },
    setSourceDedicatedAssigneeField(field) {
      this.sourceDedicatedAssigneeField = field;
    },
    setFirstComponentField(field) {
      this.priorityList[0].component = field;
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
    },
    setDragOver(e, index) {
      this.priorityList[index].isDragOver = true;
    },
    removeDragOver(e, index) {
      this.priorityList[index].isDragOver = false;
    },
    getParsedConfig(config) {
      return Object.keys(config).reduce((acc, key) => {
        try {
          acc[key] = JSON.parse(config[key]);
        } catch (e) {
          acc[key] = config[key];
        }
        return acc;
      }, {});
    },
    redirectToSettingsPage() {
      if (this.isKintoneEnvironment) {
        // eslint-disable-next-line no-undef
        window.location.href = `../../flow?app=${kintone.app.getId()}`;
      }
    },
  },
});
