<template>
  <div class="sportybot-widget">
    <button
      v-if="!isOpen"
      class="chat-toggle-btn"
      @click="isOpen = true"
      title="Chat with SportyBot"
    >
     <MessageSquare :size="28" stroke-width="2.5" />
    </button>

    <div v-if="isOpen" class="chat-window shadow">
      <div class="chat-header">
        <h5 class="flex items-center gap-2">
  <Activity :size="20" stroke-width="2" /> SportyBot
</h5>
        <button class="close-btn" @click="isOpen = false" title="Close chat">
  <X :size="20" stroke-width="2.5" />
</button>
      </div>

      <!-- Chat Messages -->
      <div class="chat-box" ref="chatBox">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['chat-msg', msg.role]"
        >
          <div class="bubble" v-html="msg.text"></div>
        </div>
      </div>

      <!-- Chat Input -->
      <form @submit.prevent="sendMessage" class="chat-input">
        <textarea
          v-model="userInput"
          placeholder="Ask me about fitness, events..."
          rows="2"
          required
        ></textarea>
        <button type="submit" :disabled="loading">
          {{ loading ? "..." : "Send" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue"
import { MessageSquare, X, Activity } from "lucide-vue-next"

// URL of backend function handling Gemini AI responses
const GEMINI_FUNCTION_URL =
  "https://us-central1-sportytribe-45a76.cloudfunctions.net/getGeminiResponse"

const isOpen = ref(false)
const userInput = ref("")
const messages = ref([])
const loading = ref(false)
const chatBox = ref(null)

/**
 * Sends a message to the Gemini AI backend and appends response
 */
const sendMessage = async () => {
  const question = userInput.value.trim()
  if (!question) return

  if (question.length < 3) {
    messages.value.push({
      role: "bot",
      text: "Hey there! Tell me a bit more - what would you like to know about fitness or events?",
    })
    userInput.value = ""
    await nextTick(() => (chatBox.value.scrollTop = chatBox.value.scrollHeight))
    return
  }

  // Add user message to chat
  messages.value.push({ role: "user", text: question })
  userInput.value = ""
  loading.value = true

  await nextTick(() => (chatBox.value.scrollTop = chatBox.value.scrollHeight))

  try {
    // Call Gemini AI Cloud Function
    const response = await fetch(GEMINI_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    })

    const data = await response.json()
    const text =
      data.text?.replace(/\n/g, "<br>") || "No valid response from Gemini."

    // Add bot response to messages
    messages.value.push({ role: "bot", text })
  } catch (err) {
    console.error("Gemini Cloud Function error:", err)
    messages.value.push({
      role: "bot",
      text: "Sorry, I couldn't get a response right now.",
    })
  } finally {
    loading.value = false
    await nextTick(() => (chatBox.value.scrollTop = chatBox.value.scrollHeight))
  }
}
</script>

<style scoped>
.chat-toggle-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 26px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease, background 0.3s ease;
  z-index: 9999;
}
.chat-toggle-btn:hover {
  transform: scale(1.05);
  background: #0056b3;
}
.chat-window {
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 340px;
  max-height: 500px;
  background: #ffffff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #ddd;
  z-index: 10000;
}
.chat-toggle-btn svg,
.close-btn svg {
  vertical-align: middle;
}

.chat-header {
  background: #007bff;
  color: white;
  padding: 0.8rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
}
.chat-box {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f9fafb;
}
.chat-msg {
  display: flex;
  margin-bottom: 10px;
}
.chat-msg.user {
  justify-content: flex-end;
}
.chat-msg.bot {
  justify-content: flex-start;
}
.bubble {
  max-width: 75%;
  padding: 0.6rem 0.9rem;
  border-radius: 18px;
  word-wrap: break-word;
  font-size: 0.9rem;
}
.user .bubble {
  background: #007bff;
  color: white;
  border-bottom-right-radius: 4px;
}
.bot .bubble {
  background: #e6f5ea;
  color: #155724;
  border-bottom-left-radius: 4px;
}
.chat-input {
  display: flex;
  flex-direction: column;
  padding: 0.6rem;
  border-top: 1px solid #ddd;
  background: #fff;
}
.chat-input textarea {
  resize: none;
  border-radius: 10px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  font-size: 0.9rem;
}
.chat-input button {
  margin-top: 0.4rem;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 10px;
  padding: 0.4rem 0;
  font-size: 0.9rem;
  cursor: pointer;
}
.chat-input button:hover {
  background: #0056b3;
}
</style>

