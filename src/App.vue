<script setup>
import {getDefaultPriorityObject, useConfigStore} from '@/stores/ConfigStore';
import {useDropDownStore} from './stores/DropDownStore';
import {storeToRefs} from 'pinia';
import {computed, onMounted, toRef, watch} from 'vue';
import Multiselect from 'vue-multiselect';

const configStore = useConfigStore();
const dropDownStore = useDropDownStore();

const {
  priorityList,
  referenceApp,
  hasConfig,
  editMode,
  priorityListLength,
  assignmentThresholdField,
  threshold,
  thisAppId,
  assigneeField,
  isKintoneEnvironment,
  formReadOnly,
  sourceAssignmentDateField,
  sourceDedicatedAssigneeField,
} = storeToRefs(configStore);
const {referenceAppFields, apps, priorityCriteriaFields, userFields, sourceDateFields, sourceAssigneeFields} = storeToRefs(dropDownStore);

const startIndexHolder = toRef(null);
const startIndexInitial = toRef(null);
const isDragging = toRef(false);

function handleDragStart(e) {
  const target = e.target;
  e.dataTransfer.setDragImage(event.target, window.outerWidth, window.outerHeight);

  isDragging.value = true;

  const row = target.closest('tr');
  const startIndex = row.getAttribute('data-index');
  startIndexHolder.value = parseInt(startIndex);
  startIndexInitial.value = parseInt(startIndex);

  configStore.priorityList.forEach((list) => {
    list.priority = null;
  });
}

function moveTarget(e) {
  const target = e.target;

  const row = target.closest('tr');
  const endIndex = row.getAttribute('data-index');

  priorityList.value.splice(parseInt(endIndex), 0, priorityList.value.splice(startIndexHolder.value, 1)[0]);

  startIndexHolder.value = parseInt(endIndex);
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
  dropDownStore.fetchDropDownApps();
  dropDownStore.fetchSourceDateFields();
  dropDownStore.fetchSourceAssigneeFields();

  if (isKintoneEnvironment.value) {
    // eslint-disable-next-line no-undef
    const config = kintone.plugin.app.getConfig(kintone.$PLUGIN_ID);

    if (hasConfig.value) {
      const parsedConfig = configStore.getParsedConfig(config);

      const {
        referenceApp,
        assignmentThresholdField,
        assigneeField,
        threshold,
        priorityList,
        sourceAssignmentDateField,
        sourceDedicatedAssigneeField,
      } = parsedConfig;

      configStore.setReferenceApp(referenceApp);
      configStore.setAssignmentThresholdField(assignmentThresholdField);
      configStore.setPriorityList(priorityList);
      configStore.setAssigneeField(assigneeField);
      configStore.setThreshold(threshold);
      configStore.setSourceAssignmentDateField(sourceAssignmentDateField);
      configStore.setSourceDedicatedAssigneeField(sourceDedicatedAssigneeField);
    }
  }
});

watch(referenceApp, (newVal) => {
  if (formReadOnly.value) return;

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

watch(assignmentThresholdField, (newVal) => {
  if (formReadOnly.value) return;

  if (!newVal) return;

  configStore.setFirstComponentField(newVal);
});

watch(priorityListLength, () => {
  if (formReadOnly.value) return;

  configStore.autoNumberingPriorityList();
});
</script>

<template>
  <div class="main-container container">
    <div class="row mb-3">
      <div class="col">
        <div class="card mb-3">
          <div class="accordion" id="accordionExample">
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingOne">
                <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseOne"
                  aria-expanded="true"
                  aria-controls="collapseOne"
                >
                  Plugin Settings
                </button>
              </h2>
              <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                <div class="accordion-body">
                  <p>This plugin is intended to be used to suggest assignee for kintone records based on the priority list.</p>
                  <p>Important notes:</p>
                  <ul>
                    <li>Make sure you have set the reference app.</li>
                    <li>Make sure you have set process management for the source app.</li>
                    <li>Please note that the plugin will only suggest assignee on the initial status.</li>
                    <li>
                      When the suggested assignee is confirmed, It will advance the status to next status and assign the selected assignee. It will
                      also increment the threshold field value by 1
                    </li>
                    <li>When the workflow reached the final status, It will decrement the threshold field value by 1</li>
                  </ul>
                  <p>Steps to use the plugin:</p>
                  <ol>
                    <li>Select the reference app.</li>
                    <ul>
                      <li>
                        Set threshold reference field. This field will be used as reference for keep track of number of assignment (increment and
                        decrement).
                      </li>
                      <li>Set assignee field. This field will be used as reference key for assignee.</li>
                      <li>Set the threshold. This input will be used as threshold for assigning.</li>
                    </ul>
                    <li>Setting for the source (this) app.</li>
                    <ul>
                      <li>Set assignment date to keep track of when the assignee is set to a record.</li>
                      <li>Set dedicated assignee field for reference in process management.</li>
                    </ul>
                    <li>Set the priority conditions (table).</li>
                    <ul>
                      <li>
                        The first row will be the default row. This row will be used as default threshold component and would be the number 1 priority
                        for auto assign suggestion. This row cannot be removed.
                      </li>
                      <li>Priority will be used to set the order of the priority list, the higher the better.</li>
                      <li>Set the component which will be used as priority evaluation.</li>
                      <li>Select the criteria for corresponding component. From lowest value or from highest value.</li>
                      <li>You can also add or remove the row from the list ass needed</li>
                      <li>Make sure you don't input the same component more than once</li>
                    </ul>
                    <li>Click the "Save" button to save the configuration.</li>
                  </ol>
                  <p>The plugin will then be available in this app to suggest assignee on record's detail.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <div d-flex flex-row>
              <button type="button" class="btn btn-primary action-button" @click.prevent="configStore.saveConfig" v-if="editMode || !formReadOnly">
                Save
              </button>
              <button type="button" class="btn btn-info action-button ms-2" @click.prevent="configStore.toggleEditMode" v-if="hasConfig">
                {{ configStore.editMode ? 'Cancel Edit' : 'Edit' }}
              </button>
              <button type="button" class="btn btn-secondary action-button ms-2" @click.prevent="configStore.redirectToSettingsPage">Cancel</button>
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
                      :disabled="apps.isLoading || formReadOnly"
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
                      :disabled="apps.isLoading || formReadOnly"
                      :showLabels="false"
                    ></Multiselect>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="dedicated-assignee-field-code" class="form-label">Dedicated Assignee Field Code</label>
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
                      :disabled="userFields.isLoading || formReadOnly"
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
      <div class="col">
        <div class="card mb-3">
          <div class="card-header">Source App Settings</div>
          <div class="card-body">
            <div class="row section upper-form-section mb-3">
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="select-assignment-field" class="form-label">Assignment Date Field</label>
                    <Multiselect
                      id="select-assignment-field"
                      v-model="sourceAssignmentDateField"
                      :options="sourceDateFields.options"
                      trackBy="code"
                      label="label"
                      placeholder="Select Field"
                      :loading="sourceDateFields.isLoading"
                      :disabled="sourceDateFields.isLoading || formReadOnly"
                      :showLabels="false"
                    ></Multiselect>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="select-assignment-field-code" class="form-label">Assignment Date Field Code</label>
                    <input class="form-control" id="select-assignment-field-code" type="text" :value="sourceAssignmentDateField?.code" disabled />
                  </div>
                </div>
              </div>
            </div>
            <div class="row section upper-form-section mb-3">
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="select-dedicated-assignee-field" class="form-label">Dedicated Assignee Field</label>
                    <Multiselect
                      id="select-dedicated-assignee-field"
                      v-model="sourceDedicatedAssigneeField"
                      :options="sourceAssigneeFields.options"
                      trackBy="code"
                      label="label"
                      placeholder="Select Field"
                      :loading="sourceAssigneeFields.isLoading"
                      :disabled="sourceAssigneeFields.isLoading || formReadOnly"
                      :showLabels="false"
                    ></Multiselect>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="row">
                  <div class="col">
                    <label for="dedicated-assignee-field-code" class="form-label">Dedicated Assignee Field Code</label>
                    <input class="form-control" id="dedicated-assignee-field-code" type="text" :value="sourceDedicatedAssigneeField?.code" disabled />
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
              v-if="listIndex !== 0 && !formReadOnly"
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
                v-if="(!isDragging || listIndex === startIndexHolder) && listIndex !== 0"
              >
                <font-awesome-icon icon="fa-solid fa-arrows-up-down" size="lg" class="drag-handle" @dragover.prevent />
              </i>
            </td>
            <td class="col-hollow-right-edge text-end align-middle" v-else></td>
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
                :disabled="referenceAppFields.isLoading || formReadOnly || listIndex === 0"
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
                :disabled="priorityCriteriaFields.isLoading || formReadOnly"
                :showLabels="false"
              ></Multiselect>
            </td>
            <td class="col-hollow">
              <div class="d-flex flex-row text-center" style="text-align: end" v-if="!formReadOnly">
                <a class="action" data-toggle="tooltip" data-placement="top" title="Add list">
                  <font-awesome-icon icon="fa-solid fa-circle-plus" size="lg" @click.prevent="configStore.addList()" />
                </a>
                <a class="action" data-toggle="tooltip" data-placement="top" title="Remove list" v-if="listIndex !== 0">
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
