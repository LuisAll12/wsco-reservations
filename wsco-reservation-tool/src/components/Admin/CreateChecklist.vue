<template>
    <div class="widget">
        <button class="btn primary" @click="dialogOpen = true">Create New Checklist</button>

        <div v-if="dialogOpen" class="overlay">
            <div class="dialog">
                <h2>Create Checklist</h2>

                <label for="boat-select">Boot auswählen</label>
                <select id="boat-select" v-model="checklist.boatId" @change="onBoatSelect">
                    <option disabled value="">-- Bitte Boot wählen --</option>
                    <option value="">Kein Boot</option>
                    <option v-for="boat in boats" :key="boat.id" :value="boat.id">
                        {{ boat.name }}
                    </option>
                </select>

                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" id="name" v-model="checklist.name" />
                </div>

                <div class="form-group">
                    <label for="description">Description:</label>
                    <textarea id="description" v-model="checklist.description"></textarea>
                </div>

                <div class="form-group">
                    <label>Tasks:</label>
                    <div v-for="(task, index) in checklist.tasks" :key="index" class="question">
                        <input type="text" v-model="checklist.tasks[index]" placeholder="Enter task" />
                        <button class="btn danger icon-btn" @click="removeTask(index)">
                            <Trash class="icon" />
                        </button>
                    </div>
                    <button class="btn secondary" @click="addTask">+ Add Task</button>
                </div>

                <div class="dialog-actions">
                    <button class="btn primary" @click="createChecklist">Create</button>
                    <button class="btn danger" @click="dialogOpen = false">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Trash } from 'lucide-vue-next';

const dialogOpen = ref(false);

onMounted(async () => {
    const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/boat`, { credentials: "include" });
    boats.value = await res.json();
});

const boats = ref([]);
const selectedBoat = ref(null);


const checklist = ref({
    name: '',
    description: '',
    tasks: [],
    boatId: null,
});

const addTask = () => {
    checklist.value.tasks.push('');
};

const removeTask = (index) => {
    checklist.value.tasks.splice(index, 1);
};

const createChecklist = async () => {
    try {
        const url = `${import.meta.env.VITE_APP_BACKEND_BASEURL}/checklist/createTasklist`;
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify(checklist.value)
        });
        // Reset form and close dialog
        checklist.value = { name: '', description: '', tasks: [] };
        dialogOpen.value = false;
    } catch (error) {
        console.error('Error creating checklist:', error);
    }
};
</script>

<style scoped>
.widget {
    background: white;
    padding: 1rem;
    border-radius: 12px;
    width: 300px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 1.5rem;
    text-align: left;
}

.btn.danger {
    background-color: #e74c3c;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s ease;
}

.icon-btn {
    border: none;
    cursor: pointer;
    margin-top: 4px;
    padding: 4px !important;
    display: flex;
    align-items: center;
    justify-content: center;

}

.icon {
    width: 16px;
    height: 16px;
    margin: 4px;
}

.btn.danger:hover {
    background-color: #c0392b;
}


.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(2px);
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}

.btn.primary {
    background: #3498db;
    color: white;
    border: none;
}

.btn.primary:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.btn.secondary {
    background: white;
    border: 1px solid #ddd;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
}

select {
    width: 100%;
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 16px;
}


.dialog {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.form-group {
    margin-bottom: 1rem;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.25rem;
    border: 1px solid #ccc;
    border-radius: 6px;
}

.question {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.question input {
    flex: 1;
    margin-right: 0.5rem;
}

.dialog-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
}
</style>
