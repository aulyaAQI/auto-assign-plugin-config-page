<script setup>
import {getDefaultPriorityObject, useConfigStore} from '@/stores/ConfigStore';
import {useDropDownStore} from './stores/DropDownStore';
import {storeToRefs} from 'pinia';
import {computed, onMounted, toRef, watch} from 'vue';
import Multiselect from 'vue-multiselect';

const configStore = useConfigStore();
const dropDownStore = useDropDownStore();

const {priorityList, referenceApp, hasConfig, editMode, priorityListLength, assignmentThresholdField, threshold, thisAppId, assigneeField} =
  storeToRefs(configStore);
const {referenceAppFields, apps, priorityCriteriaFields, userFields} = storeToRefs(dropDownStore);

const startIndexHolder = toRef(null);
const startIndexInitial = toRef(null);
const isDragging = toRef(false);

function handleDragStart(e) {
  const target = e.target;
  console.log('yo wadap');
  e.dataTransfer.setDragImage(event.target, window.outerWidth, window.outerHeight);

  isDragging.value = true;

  const row = target.closest('tr');
  const startIndex = row.getAttribute('data-index');
  console.log({startIndex});
  startIndexHolder.value = parseInt(startIndex);
  startIndexInitial.value = parseInt(startIndex);
  console.log(isDragging.value);

  configStore.priorityList.forEach((list, index) => {
    list.priority = null;
  });
}

function moveTarget(e, listIndex) {
  const target = e.target;

  const row = target.closest('tr');
  const endIndex = row.getAttribute('data-index');

  const elName = e.target.localName;

  if (elName !== 'td' && elName !== 'tr' && elName !== 'table' && elName !== 'tbody' && elName !== 'div') {
    console.log({elName});
  }

  priorityList.value.splice(parseInt(endIndex), 0, priorityList.value.splice(startIndexHolder.value, 1)[0]);

  startIndexHolder.value = parseInt(endIndex);
  // console.log({stRef: startIndexHolder.value, listIndex});
}

function handleDragEnd(e) {
  startIndexHolder.value = null;

  configStore.autoNumberingPriorityList();

  configStore.priorityList.forEach((list, index) => {
    configStore.removeDragOver(e, index);
  });

  isDragging.value = false;
  startIndexHolder.value = null;
  startIndexInitial.value = null;
}

onMounted(() => {
  console.log('mounted');

  dropDownStore.fetchDropDownApps();

  if (typeof kintone !== 'undefined') {
    // eslint-disable-next-line no-undef
    const config = kintone.plugin.app.getConfig(kintone.$PLUGIN_ID);
    console.log({config});

    if (hasConfig.value) {
      const parsedConfig = configStore.getParsedConfig(config);

      const {referenceApp, assignmentThresholdField, assigneeField, threshold, priorityList} = parsedConfig;

      console.log({referenceApp, assignmentThresholdField, assigneeField, threshold, priorityList});

      configStore.setReferenceApp(referenceApp);
      configStore.setAssignmentThresholdField(assignmentThresholdField);
      configStore.setPriorityList(priorityList);
      configStore.setAssigneeField(assigneeField);
      configStore.setThreshold(threshold);
    }

    console.log(configStore.$state);
  }
});

watch(referenceApp, (newVal) => {
  if (hasConfig.value && !editMode.value) return;

  if (!newVal) return;

  dropDownStore.fetchDropDownFields(newVal.appId);
  dropDownStore.fetchUserFields(newVal.appId);

  const defaultObj = getDefaultPriorityObject();
  defaultObj.criteria = {
    label: 'High to low',
    criteria: 'htl',
  };

  priorityList.value = [defaultObj];
  assignmentThresholdField.value = null;
  configStore.autoNumberingPriorityList();
});

watch(priorityListLength, () => {
  if (hasConfig.value && !editMode.value) return;

  configStore.autoNumberingPriorityList();
});
</script>

<template>
  <div class="main-container container">
    <div class="row mb-3">
      <div class="col">
        <div class="card mb-3">
          <div class="card-header">Plugin Settings</div>
          <div class="card-body"></div>
          <div class="card-footer">
            <div d-flex flex-row>
              <button type="button" class="btn btn-primary action-button" @click.prevent="configStore.saveConfig()">Save</button>
              <button type="button" class="btn btn-info action-button ms-2" @click.prevent="configStore.toggleEditMode" v-if="hasConfig">
                {{ configStore.editMode ? 'Cancel Edit' : 'Edit' }}
              </button>
              <button type="button" class="btn btn-secondary action-button ms-2" @click.prevent="() => history.back()">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col">
        <div class="card mb-3">
          <div class="card-header">Reference App Settings</div>
          <div class="card-body">
            <div class="row section upper-form-section mb-3">
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="select-referenceApp" class="form-label">Reference App Name</label>
                    <Multiselect
                      id="select-referenceApp"
                      v-model="referenceApp"
                      :options="apps.options"
                      trackBy="appId"
                      label="label"
                      placeholder="Select App"
                      :loading="apps.isLoading"
                      :disabled="apps.isLoading || (!editMode && hasConfig)"
                      :showLabels="false"
                    ></Multiselect>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="reference-app-id" class="form-label">Reference App Id</label>
                    <input class="form-control" id="reference-app-id" type="text" :value="referenceApp?.appId" disabled />
                  </div>
                </div>
              </div>
            </div>
            <div class="row section upper-form-section mb-3">
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="select-assignment-threshold-field" class="form-label">Assignment Threshold Field</label>
                    <Multiselect
                      id="select-assignment-threshold-field"
                      v-model="assignmentThresholdField"
                      :options="referenceAppFields.options"
                      trackBy="code"
                      label="label"
                      placeholder="Select Field"
                      :loading="apps.isLoading"
                      :disabled="apps.isLoading || (!editMode && hasConfig)"
                      :showLabels="false"
                    ></Multiselect>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="assignment-threshold-field-code" class="form-label">Assignment Threshold Field Code</label>
                    <input class="form-control" id="assignment-threshold-field-code" type="text" :value="assignmentThresholdField?.code" disabled />
                  </div>
                </div>
              </div>
            </div>
            <div class="row section upper-form-section mb-3">
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="select-assignment-threshold-field" class="form-label">Assignee Field</label>
                    <Multiselect
                      id="select-assignment-threshold-field"
                      v-model="assigneeField"
                      :options="userFields.options"
                      trackBy="code"
                      label="label"
                      placeholder="Select User Field"
                      :loading="userFields.isLoading"
                      :disabled="userFields.isLoading || (!editMode && hasConfig)"
                      :showLabels="false"
                    ></Multiselect>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="assignee-field-code" class="form-label">Assignee Field Code</label>
                    <input class="form-control" id="assignee-field-code" type="text" :value="assigneeField?.code" disabled />
                  </div>
                </div>
              </div>
            </div>
            <div class="row section upper-form-section mb-3">
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="threshold" class="form-label">Threshold</label>
                    <input class="form-control" id="threshold" type="number" v-model="threshold" :disabled="!editMode && hasConfig" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="container-table container" v-if="referenceApp?.appId">
    <div class="table-wrapper">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th scope="col" class="col-hollow-right-edge col-sm-1"></th>
            <th scope="col" class="col-sm-1">Priority</th>
            <th scope="col" class="col-sm-3">Component Field</th>
            <th scope="col" class="col-sm-3">Component Field Code</th>
            <th scope="col" class="col-sm-3">Criteria</th>
            <th scope="col" class="col-hollow col-sm-1"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(list, listIndex) in priorityList" :key="listIndex" :data-index="listIndex">
            <td
              class="col-hollow-right-edge text-end align-middle"
              @dragover.prevent="moveTarget($event, listIndex)"
              :class="{
                'bg-highlight': startIndexHolder !== listIndex && isDragging,
                'bg-current-highlight': startIndexHolder === listIndex && isDragging,
              }"
            >
              <!-- v-if="!isDragging || listIndex === startIndexHolder" -->
              <i
                class="me-2 drag-handle text-end"
                data-toggle="tooltip"
                data-placement="top"
                title="Reorder list"
                draggable="true"
                @dragover.prevent
                @dragstart="handleDragStart"
                @dragend="handleDragEnd"
                v-if="!isDragging || listIndex === startIndexHolder"
              >
                <font-awesome-icon icon="fa-solid fa-arrows-up-down" size="lg" class="drag-handle" @dragover.prevent />
              </i>
            </td>
            <td>
              <input class="form-control" type="number" :value="list.priority" disabled />
            </td>
            <td>
              <Multiselect
                v-model="list.component"
                :options="referenceAppFields.options"
                trackBy="code"
                label="label"
                :loading="referenceAppFields.isLoading"
                :disabled="referenceAppFields.isLoading || (!editMode && hasConfig)"
                :showLabels="false"
              ></Multiselect>
            </td>
            <td>
              <input class="form-control" type="text" :value="list.component?.code" disabled />
            </td>
            <td>
              <Multiselect
                v-model="list.criteria"
                :options="priorityCriteriaFields.options"
                trackBy="criteria"
                label="label"
                :loading="priorityCriteriaFields.isLoading"
                :disabled="priorityCriteriaFields.isLoading || (!editMode && hasConfig)"
                :showLabels="false"
              ></Multiselect>
            </td>
            <td class="col-hollow">
              <div class="d-flex flex-row text-center" style="text-align: end">
                <a class="action" data-toggle="tooltip" data-placement="top" title="Add list">
                  <font-awesome-icon icon="fa-solid fa-circle-plus" size="lg" @click.prevent="configStore.addList()" />
                </a>
                <a class="action" data-toggle="tooltip" data-placement="top" title="Remove list">
                  <font-awesome-icon icon="fa-solid fa-circle-minus" size="lg" @click.prevent="configStore.removeList(listIndex)" />
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.col-hollow {
  border-top-style: hidden;
  border-right-style: hidden;
  border-bottom-style: hidden;
}

.col-hollow-right-edge {
  border-top-style: hidden;
  border-bottom-style: hidden;
  border-left-style: hidden;
}

.col-hollow-left-edge {
  border-top-style: hidden;
  border-bottom-style: hidden;
  border-right-style: hidden;
}

.single-col-hollow {
  border-top-style: hidden;
  border-bottom-style: hidden;
}

.big-checkbox {
  width: 30px;
  height: 30px;
}

.action {
  margin: 0 2px;
}

.action:hover {
  cursor: pointer;
}

.action-container {
  text-align: center;
}

input[type='number'] {
  /* width: 50px; */
}

.table-wrapper {
  overflow-x: auto;
  height: 80vh;
}

table {
  /* table-layout: fixed; */
  min-width: 800px;
  /* transform: scale(2); */
  word-wrap: break-word;
}

/* .sticky-col {
  position: -webkit-sticky;
  position: sticky;
  left: 0;
  background-color: white;
  z-index: 2;
}

.sticky-col-1 {
  left: 0;
  z-index: 2;
} */

/* th:not(:last-child, :first-child) {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  background-color: gray !important;
  z-index: 2;
} */

/* th:first-child {
  z-index: 3;
} */

.standard-size-col {
  width: 200px;
}

.cursor-move {
  cursor: pointer;
}

.bg-highlight {
  background-color: gray;
  border: 1px solid black;
  color: white;
  cursor: none;
}

.bg-current-highlight {
  background-color: lightgray;
  border: 1px solid black;
  color: white;
  cursor: none;
}

.drag-handle {
  cursor: move; /* fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}

.drag-handle:hover {
  cursor: move;
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}

.drag-handle:active {
  cursor: grabbing;
  cursor: -moz-grabbing;
  cursor: -webkit-grabbing;
}
</style>
