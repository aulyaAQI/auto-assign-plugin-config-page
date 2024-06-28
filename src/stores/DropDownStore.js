import {defineStore} from 'pinia';
import {generateClient} from '@/helper/kintone';
import {useConfigStore} from './ConfigStore';

const client = generateClient();
export const useDropDownStore = defineStore({
  id: 'dropdown',
  state: () => ({
    assignmentThresholdFields: {
      options: [],
      isLoading: false,
    },
    userFields: {
      options: [],
      isLoading: false,
    },
    apps: {
      options: [],
      isLoading: false,
    },
    referenceAppFields: {
      options: [],
      isLoading: false,
    },
    sourceDateFields: {
      options: [],
      isLoading: false,
    },
    sourceAssigneeFields: {
      options: [],
      isLoading: false,
    },
    priorityCriteriaFields: {
      options: [
        {
          label: 'High to low',
          criteria: 'htl',
        },
        {
          label: 'Low to high',
          criteria: 'lth',
        },
      ],
      isLoading: false,
    },
  }),
  getters: {},
  actions: {
    async fetchUserFields(appId) {
      this.userFields.isLoading = true;
      const response = await client.app.getFormFields({
        app: appId,
      });

      const fieldsArr = Object.keys(response.properties)
        .map((fieldCode) => {
          const field = response.properties[fieldCode];

          const type = field.type;
          const code = field.code;
          const label = field.label;

          return {
            label,
            type,
            code,
          };
        })
        .filter((field) => field.type === 'USER_SELECT');

      this.userFields.options = fieldsArr;
      this.userFields.isLoading = false;

      return fieldsArr;
    },
    async fetchDropDownApps() {
      const configStore = useConfigStore();
      const thisAppId = configStore.thisAppId;

      this.apps.isLoading = true;
      const response = await client.app.getApps();

      this.apps.options = response.apps
        .map((app) => ({
          label: app.name,
          appId: app.appId,
        }))
        .filter((app) => app.appId !== thisAppId.toString());

      this.apps.isLoading = false;
    },
    async fetchDropDownFields(appId) {
      this.referenceAppFields.isLoading = true;
      const response = await client.app.getFormFields({
        app: appId,
      });

      const fieldsArr = Object.keys(response.properties)
        .map((fieldCode) => {
          const field = response.properties[fieldCode];

          const type = field.type;
          const code = field.code;
          const label = field.label;

          return {
            label,
            type,
            code,
          };
        })
        .filter((field) => field.type === 'NUMBER');

      this.referenceAppFields.options = fieldsArr;
      this.referenceAppFields.isLoading = false;

      return fieldsArr;
    },
    async fetchSourceDateFields() {
      const configStore = useConfigStore();
      const appId = configStore.thisAppId;

      this.sourceDateFields.isLoading = true;
      const response = await client.app.getFormFields({
        app: appId,
      });

      const fieldsArr = Object.keys(response.properties)
        .map((fieldCode) => {
          const field = response.properties[fieldCode];

          const type = field.type;
          const code = field.code;
          const label = field.label;

          return {
            label,
            type,
            code,
          };
        })
        .filter((field) => field.type === 'DATE');

      this.sourceDateFields.options = fieldsArr;

      this.sourceDateFields.isLoading = false;

      return fieldsArr;
    },
    async fetchSourceAssigneeFields() {
      const configStore = useConfigStore();
      const appId = configStore.thisAppId;

      this.sourceAssigneeFields.isLoading = true;
      const response = await client.app.getFormFields({
        app: appId,
      });

      const fieldsArr = Object.keys(response.properties)
        .map((fieldCode) => {
          const field = response.properties[fieldCode];

          const type = field.type;
          const code = field.code;
          const label = field.label;

          return {
            label,
            type,
            code,
          };
        })
        .filter((field) => field.type === 'USER_SELECT');

      this.sourceAssigneeFields.options = fieldsArr;

      this.sourceAssigneeFields.isLoading = false;

      return fieldsArr;
    },
    isEmpty(obj) {
      for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
          return false;
        }
      }

      return true;
    },
  },
});
