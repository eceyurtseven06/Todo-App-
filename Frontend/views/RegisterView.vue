<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo-circle">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>Create Account</h2>
      </div>

      <form @submit.prevent="registerUser" class="register-form">
        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input 
              v-model="username" 
              type="text" 
              id="username" 
              placeholder="Choose a username"
              required 
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="16" r="1" stroke="currentColor" stroke-width="2"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
            </svg>
            <input 
              v-model="password" 
              type="password" 
              id="password" 
              placeholder="Create a secure password"
              required 
            />
            <div class="password-strength">
              <div class="strength-bar" :class="passwordStrength.class">
                <div class="strength-fill" :style="{ width: passwordStrength.width }"></div>
              </div>
              <span class="strength-text">{{ passwordStrength.text }}</span>
            </div>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4905 2.02168 11.3363C2.16356 9.18218 2.99721 7.13677 4.39828 5.49062C5.79935 3.84447 7.69279 2.69315 9.79619 2.20548C11.8996 1.71781 14.1003 1.91895 16.07 2.78" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ successMessage }}
        </div>

        <button type="submit" class="register-button" :disabled="isLoading">
          <span v-if="!isLoading">Create Account</span>
          <div v-else class="loading-spinner"></div>
        </button>

        <div class="form-footer">
          <p>Already have an account? <router-link to="/login" class="login-link">Sign in here</router-link></p>
        </div>
      </form>
    </div>

    <div class="background-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);

const API_URL = 'http://localhost:5000/api/auth/register';

// Password strength calculator
const passwordStrength = computed(() => {
  const pwd = password.value;
  if (!pwd) return { class: '', width: '0%', text: '' };
  
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  
  switch (score) {
    case 0:
    case 1:
      return { class: 'weak', width: '20%', text: 'Weak' };
    case 2:
      return { class: 'fair', width: '40%', text: 'Fair' };
    case 3:
      return { class: 'good', width: '60%', text: 'Good' };
    case 4:
      return { class: 'strong', width: '80%', text: 'Strong' };
    case 5:
      return { class: 'very-strong', width: '100%', text: 'Very Strong' };
    default:
      return { class: '', width: '0%', text: '' };
  }
});

async function registerUser() {
  if (isLoading.value) return;
  
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await axios.post(API_URL, {
      username: username.value,
      password: password.value
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.status === 200) {
      successMessage.value = 'Registration successful! Redirecting to login...';
      
      // Add a delay for better UX
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      errorMessage.value = error.response.data.message || 'Registration failed. Please try again.';
    } else {
      errorMessage.value = 'An unexpected error occurred. Please try again later.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2dd4bf 0%, #06b6d4 50%, #3b82f6 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
  min-width: 100vw;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 15%;
  left: 15%;
  animation-delay: 0s;
}

.shape-2 {
  width: 140px;
  height: 140px;
  top: 70%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 70px;
  height: 70px;
  bottom: 15%;
  left: 25%;
  animation-delay: 4s;
}

.shape-4 {
  width: 90px;
  height: 90px;
  top: 40%;
  right: 20%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg) scale(1); 
    opacity: 0.7;
  }
  33% { 
    transform: translateY(-30px) rotate(120deg) scale(1.1); 
    opacity: 0.9;
  }
  66% { 
    transform: translateY(15px) rotate(240deg) scale(0.9); 
    opacity: 0.8;
  }
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 2;
  transform: translateY(0);
  transition: all 0.3s ease;
}

.register-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.3);
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-circle {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #2dd4bf, #3b82f6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(45, 212, 191, 0.3);
  transition: all 0.3s ease;
}

.logo-circle:hover {
  transform: scale(1.1) rotate(-10deg);
}

.logo-circle svg {
  width: 28px;
  height: 28px;
}

.register-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.register-header p {
  color: #718096;
  margin: 0;
  font-size: 16px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 16px;
  width: 20px;
  height: 20px;
  color: #a0aec0;
  z-index: 1;
  transition: color 0.3s ease;
}

.input-wrapper:focus-within .input-icon {
  color: #2dd4bf;
}

input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  background: #f8fafc;
  transition: all 0.3s ease;
  outline: none;
}

input:focus {
  border-color: #2dd4bf;
  background: white;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.1);
  transform: translateY(-1px);
}

input::placeholder {
  color: #a0aec0;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-bar.weak .strength-fill { background: #ef4444; }
.strength-bar.fair .strength-fill { background: #f97316; }
.strength-bar.good .strength-fill { background: #eab308; }
.strength-bar.strong .strength-fill { background: #22c55e; }
.strength-bar.very-strong .strength-fill { background: #16a34a; }

.strength-text {
  font-size: 12px;
  font-weight: 600;
  min-width: 80px;
}

.strength-text {
  color: #718096;
}

.strength-bar.weak + .strength-text { color: #ef4444; }
.strength-bar.fair + .strength-text { color: #f97316; }
.strength-bar.good + .strength-text { color: #eab308; }
.strength-bar.strong + .strength-text { color: #22c55e; }
.strength-bar.very-strong + .strength-text { color: #16a34a; }

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e53e3e;
  font-size: 14px;
  padding: 12px 16px;
  background: rgba(229, 62, 62, 0.1);
  border: 1px solid rgba(229, 62, 62, 0.2);
  border-radius: 8px;
  animation: shake 0.5s ease-in-out;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #22c55e;
  font-size: 14px;
  padding: 12px 16px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 8px;
  animation: slideIn 0.5s ease-in-out;
}

.error-message svg,
.success-message svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@keyframes slideIn {
  0% { transform: translateY(-10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.register-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #2dd4bf, #3b82f6);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 20px rgba(45, 212, 191, 0.3);
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(45, 212, 191, 0.4);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.form-footer {
  text-align: center;
  margin-top: 8px;
}

.form-footer p {
  color: #718096;
  font-size: 14px;
  margin: 0;
}

.login-link {
  color: #2dd4bf;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #3b82f6;
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 480px) {
  .register-card {
    padding: 32px 24px;
    margin: 20px;
  }
  
  .register-header h2 {
    font-size: 24px;
  }
  
  .floating-shape {
    display: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .register-card {
    background: rgba(26, 32, 44, 0.95);
    color: #f7fafc;
  }
  
  .register-header h2 {
    color: #f7fafc;
  }
  
  .register-header p {
    color: #a0aec0;
  }
  
  .form-group label {
    color: #e2e8f0;
  }
  
  input {
    background: #2d3748;
    border-color: #4a5568;
    color: #f7fafc;
  }
  
  input:focus {
    background: #1a202c;
  }
  
  .form-footer p {
    color: #a0aec0;
  }
}
</style>