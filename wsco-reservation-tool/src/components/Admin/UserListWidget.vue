<template>
    <div>
        <!-- Widget Preview -->
        <div class="widget" @click="showModal = true">
            <h2>Mitgliederliste</h2>
            <ul>
                <li v-for="(user, index) in users.slice(0, 3)" :key="index" class="user-list-item">
                    <div class="avatar" :style="{ backgroundColor: stringToColor(user.name) }">
                        {{ getInitials(user.name) }}
                    </div>
                    <div class="info">
                        <div class="name">{{ user.name }}</div>
                    </div>
                </li>
            </ul>
            <div class="see-more">Klicke, um alle Mitglieder zu verwalten</div>
        </div>

        <!-- Modal Dialog -->
        <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
            <div class="modal-content">
                <h3 style="text-align: center; transform: translateY(-20px);">Mitglieder verwalten</h3>
                <ul>
                    <li v-for="(user, index) in users" :key="index" class="modal-user-item">
                        <div class="avatar" :style="{ backgroundColor: stringToColor(user.name) }">
                            {{ getInitials(user.name) }}
                        </div>
                        <input v-model="user.name" class="user-input" />
                        <select v-model="user.Role" @change="onRoleChange(user)" class="role-dropdown">
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="cashier">Cashier</option>
                            <option value="bootmanager">Boot Manager</option>
                        </select>
                        <Trash class="delete-icon" @click="userToDelete = index" />
                    </li>
                </ul>
            </div>
        </div>
        <!-- Bestätigungsdialog zum Löschen -->
        <div v-if="userToDelete !== null" class="modal-backdrop" @click.self="cancelDelete">
            <div class="confirm-dialog">
                <h4>Benutzer wirklich löschen?</h4>
                <p>Dieser Vorgang kann nicht rückgängig gemacht werden.</p>
                <div class="confirm-actions">
                    <button class="confirm-btn danger" @click="confirmDelete">
                        Ja, löschen
                    </button>
                    <button class="confirm-btn" @click="cancelDelete">
                        Abbrechen
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Trash } from 'lucide-vue-next'

const showModal = ref(false)

const users = ref([])

onMounted(async () => {
    try {

        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/admin/getUsers`, {
            method: "GET",
            credentials: "include",
        });

        const data = await res.json();

        users.value = [...data]

    } catch (e) {
        console.log(e)
    }

})

const onRoleChange = async (user) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_BASEURL}/admin/roleChange/${user.id}?role=${user.Role}`, {
            method: "PUT",
            credentials: "include",
        })
    } catch (e) {
        console.error(e)
    }
}

const getInitials = (name) =>
    name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()

const stringToColor = (str) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = hash % 360
    return `hsl(${hue}, 60%, 65%)`
}


const userToDelete = ref(null)
const confirmDelete = () => {
    if (userToDelete.value !== null) {
        users.value.splice(userToDelete.value, 1)
        userToDelete.value = null
    }
}
const cancelDelete = () => {
    userToDelete.value = null
}




const closeModal = () => {
    showModal.value = false
}
</script>

<style scoped>
* {
    font-family: 'Segoe UI', Roboto, sans-serif;
    box-sizing: border-box;
}

.widget {
    background: linear-gradient(to bottom right, #f9f9f9, #ffffff);
    padding: 1.2rem;
    border-radius: 16px;
    width: 320px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: transform 0.2s ease;
}

.widget:hover {
    transform: translateY(-2px);
}

h2 {
    margin-bottom: 1rem;
    font-size: 1.25rem;
}

.user-list-item {
    display: flex;
    align-items: center;
    padding: 0.4rem 0;
    border-bottom: 1px solid #eee;
    gap: 0.6rem;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: white;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.info {
    display: flex;
    flex-direction: column;
}

.name {
    font-weight: 500;
    font-size: 0.95rem;
}

.role-tag {
    font-size: 0.75rem;
    background-color: #e0e0e0;
    padding: 0.2rem 0.5rem;
    border-radius: 8px;
    display: inline-block;
    margin-top: 0.2rem;
}

.see-more {
    color: #007bff;
    margin-top: 1rem;
    font-size: 0.9rem;
    text-align: center;
}

/* Modal */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(20, 20, 20, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #fff;
    padding: 2rem;
    border-radius: 14px;
    width: 90%;
    max-width: 520px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
    margin-bottom: 1rem;
    font-size: 1.3rem;
}

.modal-user-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.8rem;
}

.user-input {
    flex: 1;
    padding: 0.4rem 0.6rem;
    border: 1px solid #ccc;
    border-radius: 8px;
}

.role-dropdown {
    padding: 0.35rem;
    border-radius: 8px;
    border: 1px solid #ccc;
}

.delete-icon {
    color: crimson;
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
}

.modal-actions {
    display: flex;
    justify-content: space-evenly;
    margin-top: 1.5rem;
}

.confirm-dialog {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    width: 320px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    text-align: center;
}

.confirm-dialog h4 {
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
}

.confirm-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.confirm-btn {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    background-color: #ccc;
}

.confirm-btn.danger {
    background-color: #dc3545;
    color: white;
}
</style>
