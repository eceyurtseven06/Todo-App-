<template>
  <div class="sticky-wall-container">
    <div class="header">
      <div class="menu-item" @click="showLogout = true">
        <span class="menu-icon">🚪</span>
        Sign out
      </div>
      <div v-if="showLogout" class="modal-overlay">
        <div class="modal-box">
          <div class="modal-icon">👋</div>
          <h3>Sign Out</h3>
          <p>Are you sure you want to sign out?</p>
          <div class="modal-buttons">
            <button @click="handleSignOut" class="confirm-btn">Yes</button>
            <button @click="showLogout = false" class="cancel-btn">No</button>
          </div>
        </div>
      </div>
      
      <div class="main-content">
        <div class="title-bar">
          <div class="title-section">
            <h1> Tasks</h1>
          </div>
          <div class="stats-section">
            <div class="stat-item">
              <span class="stat-number">{{ todos.length }}</span>
              <span class="stat-label">Total</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ completedCount }}</span>
              <span class="stat-label">Done</span>
            </div>
          </div>
        </div>

        <!-- Task Cards -->
        <div class="cards">
          <div v-for="todo in todos" :key="todo.id" class="sticky-card" :class="{ completed: todo.completed }"
            :style="getCardColor(todo.id)">
            <div v-if="editingId === todo.id" class="edit-mode">
              <input v-model="editedTask" placeholder="Edit task title..." class="edit-input" />
              <textarea v-model="editedDescription" placeholder="Edit description..." class="edit-textarea"></textarea>
              <div class="edit-actions">
                <button @click="saveEdit(todo.id)" class="save-btn"> Save</button>
                <button @click="cancelEdit" class="cancel-btn"> Cancel</button>
              </div>
            </div>
            <div v-else class="card-content">
              <div class="card-header">
                <h3>{{ todo.title }}</h3>
                <div class="task-status" :class="{ completed: todo.completed }">
                  {{ todo.completed ? '✅' : '⏳' }}
                </div>
              </div>
              <p class="description">{{ todo.description || 'No description added' }}</p>
              <div class="card-actions">
                <label class="checkbox-wrapper">
                  <input type="checkbox" v-model="todo.completed" @change="toggleComplete(todo)" />
                  <span class="checkmark"></span>
                  <span class="checkbox-label">{{ todo.completed ? 'Completed' : 'Mark as done' }}</span>
                </label>
                <div class="action-buttons">
                  <button v-if="!todo.completed" @click="startEdit(todo)" class="edit-btn" title="Edit task">
                    ✏️
                  </button>
                  <button @click="deleteTodo(todo.id)" class="delete-btn" title="Delete task">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Button Card -->
          <div class="add-card" @click="showPopup = true">
            <div class="add-content">
              <div class="add-icon">➕</div>
              <h3>Add New Task</h3>
              <p>Click to create a task</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Popup -->
      <div class="modal-backdrop" v-if="showPopup" @click="showPopup = false">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h2>✨ Create New Task</h2>
            <button @click="showPopup = false" class="close-btn">×</button>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <label>Task Title</label>
              <input v-model="newTask" placeholder="What needs to be done?" class="modal-input" />
            </div>
            <div class="input-group">
              <label>Description</label>
              <textarea v-model="newDescription" placeholder="Add more details..." class="modal-textarea"></textarea>
            </div>
          </div>
          <div class="modal-buttons">
            <button @click="addTodo" class="add-btn">Create Task</button>
            <button class="cancel-btn" @click="showPopup = false">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/axios';

const router = useRouter();
const isLoggedIn = ref(false);
const newDescription = ref('');
const editedDescription = ref('');
const showPopup = ref(false);
const showLogout = ref(false);

function handleSignOut() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

watchEffect(() => {
  isLoggedIn.value = !!localStorage.getItem('token');
});

function logout() {
  localStorage.removeItem('token');
  isLoggedIn.value = false;
  router.push('/login');
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  description?: string;
}

const API_URL = 'http://localhost:5000/api/todo';

const todos = ref<Todo[]>([]);
const newTask = ref('');
const editingId = ref<number | null>(null);
const editedTask = ref('');

const completedCount = computed(() => 
  todos.value.filter(todo => todo.completed).length
);

// Enhanced card colors with gradients
const cardColors = [
  { background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%)', shadow: 'rgba(168, 230, 207, 0.3)' }, // Light green
  { background: 'linear-gradient(135deg, #a8e6cf 0%, #88d8c0 100%)', shadow: 'rgba(168, 230, 207, 0.3)' }, // Mint green
  { background: 'linear-gradient(135deg, #fab1a0 0%, #fdcb6e 100%)', shadow: 'rgba(250, 177, 160, 0.3)' }, // Peach
  { background: 'linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)', shadow: 'rgba(225, 112, 85, 0.3)' }, // Coral
  { background: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)', shadow: 'rgba(253, 121, 168, 0.3)' }, // Pink peach
  { background: 'linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%)', shadow: 'rgba(116, 185, 255, 0.3)' }, // Light blue
  { background: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)', shadow: 'rgba(85, 239, 196, 0.3)' }, // Light mint
];

function getCardColor(id: number) {
  const colorIndex = id % cardColors.length;
  const color = cardColors[colorIndex];
  return {
    background: color.background,
    boxShadow: `0 8px 32px ${color.shadow}`
  };
}

onMounted(async () => {
  try {
    const response = await api.get(API_URL + '/getAll');
    todos.value = response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
});

async function addTodo() {
  if (newTask.value.trim() === '') return;

  try {
    const response = await api.post(API_URL, {
      title: newTask.value.trim(),
      description: newDescription.value.trim(),
      completed: false
    });

    todos.value.push(response.data);
    newTask.value = '';
    newDescription.value = '';
    showPopup.value = false;
  } catch (error) {
    console.error('Error adding task:', error);
  }
}

async function deleteTodo(id: number) {
  try {
    await api.delete(`${API_URL}/${id}`);
    todos.value = todos.value.filter(todo => todo.id !== id);
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}

function startEdit(todo: Todo) {
  editingId.value = todo.id;
  editedTask.value = todo.title;
  editedDescription.value = todo.description || '';
}

async function saveEdit(id: number) {
  const todo = todos.value.find(t => t.id === id);
  if (!todo || editedTask.value.trim() === '') return;

  try {
    const updated = {
      ...todo,
      title: editedTask.value.trim(),
      description: editedDescription.value.trim() || todo.description
    };
    await api.put(`${API_URL}/${id}`, updated);
    todo.title = updated.title;
    todo.description = updated.description;
    editingId.value = null;
    editedTask.value = '';
    editedDescription.value = '';
  } catch (error) {
    console.error('Error updating task:', error);
  }
}

function cancelEdit() {
  editingId.value = null;
  editedTask.value = '';
  editedDescription.value = '';
}

async function toggleComplete(todo: Todo) {
  try {
    await api.put(`${API_URL}/${todo.id}`, {
      ...todo,
      completed: todo.completed
    });
  } catch (error) {
    console.error('Error toggling complete:', error);
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

.sticky-wall-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-width: 100vw;
}

.header {
  display: flex;
  width: 100%;
  position: relative;
}

.menu-item {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 20px;
  border-radius: 50px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  z-index: 10;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.menu-icon {
  font-size: 18px;
}

.main-content {
  display: flex;
  flex-direction: column;
  padding: 40px;
  min-height: 100vh;
  width: 100%;
}

.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}

.title-section h1 {
  margin: 0;
  font-size: 42px;
  color: white;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
}

.subtitle {
  margin: 0;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

.stats-section {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
  color: white;
}

.stat-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 1px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.sticky-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.sticky-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--card-gradient);
}

.sticky-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}

.sticky-card.completed {
  opacity: 0.7;
  transform: scale(0.98);
}

.sticky-card.completed .card-header h3 {
  text-decoration: line-through;
}

.sticky-card.completed .description {
  text-decoration: line-through;
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.sticky-card h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  flex: 1;
}

.task-status {
  font-size: 20px;
  margin-left: 10px;
  opacity: 0.7;
}

.description {
  flex: 1;
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  min-height: 40px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex: 1;
}

.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  border-color: #43e97b;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgb(0, 0, 0);
  font-size: 12px;
  font-weight: bold;
}

.checkbox-label {
  font-size: 14px;
  color: #000000;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: rgba(67, 233, 123, 0.2);
  transform: scale(1.1);
}

.delete-btn:hover {
  background: rgba(255, 107, 107, 0.2);
  transform: scale(1.1);
}

.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

.edit-input,
.edit-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  transition: all 0.3s ease;
}

.edit-input:focus,
.edit-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.edit-textarea {
  flex: 1;
  min-height: 80px;
  resize: none;
}

.edit-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.save-btn,
.cancel-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.save-btn {
  background: linear-gradient(135deg, #5187ec90 0%, #4e81f8a8 100%);
  color: white;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 233, 123, 0.4);
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #eee;
  transform: translateY(-2px);
}

.add-card {
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);
}

.add-card:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-5px);
}

.add-content {
  text-align: center;
  color: white;
}

.add-icon {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.8;
}

.add-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.add-content p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 20px;
  width: 500px;
  max-width: 90vw;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 25px 30px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  font-size: 24px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.modal-body {
  padding: 30px;
}

.input-group {
  margin-bottom: 25px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.modal-input,
.modal-textarea {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.02);
}

.modal-input:focus,
.modal-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-textarea {
  min-height: 120px;
  resize: none;
}

.modal-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding: 20px 30px 30px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  text-align: center;
  max-width: 400px;
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.modal-box h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.modal-box p {
  margin: 0 0 30px 0;
  color: #666;
  font-size: 16px;
}

.confirm-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  margin-right: 15px;
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #eee;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 20px;
  }

  .title-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .title-section h1 {
    font-size: 32px;
  }

  .cards {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .modal {
    width: 95vw;
    margin: 20px;
  }

  .menu-item {
    position: fixed;
    bottom: 10px;
    right: 10px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 15px;
  }

  .title-section h1 {
    font-size: 28px;
  }

  .sticky-card {
    padding: 20px;
  }
}
</style>