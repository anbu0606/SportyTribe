<template>
 <main class="container mt-5" role="main">
    <form @submit.prevent="sendEmail" class="p-4 shadow rounded bg-white" aria-labelledby="pageTitle">
      <!-- Email input -->
      <div class="mb-3">
        <label for="email">Your Email <span class="text-danger">*</span></label>
        <input 
          id="email" 
          type="email" 
          v-model="email" 
          required 
          aria-required="true" 
          class="form-control" 
          placeholder="Enter your email" 
        />
      </div>

      <!-- Subject input -->
      <div class="mb-3">
        <label for="subject">Subject <span class="text-danger">*</span></label>
        <input 
          type="text" 
          id="subject" 
          v-model="subject" 
          required 
          aria-required="true" 
          class="form-control" 
          placeholder="Enter subject" 
        />
      </div>

      <div class="mb-3">
        <label for="message">Message <span class="text-danger">*</span></label>
        <textarea 
          id="message" 
          v-model="message" 
          required 
          aria-required="true" 
          class="form-control" 
          rows="5" 
          placeholder="Type your message here"
        ></textarea>
      </div>
      
      <!-- File attachment -->
      <div class="mb-3">
        <label for="fileInput">Attach a file (optional)</label>
        <input 
          type="file" 
          id="fileInput" 
          @change="onFileChange" 
          class="form-control" 
          aria-describedby="fileHelp" 
        />
        <small id="fileHelp" class="form-text text-muted">
          You may attach a document.
        </small>
      </div>

      <button 
        class="btn btn-success" 
        type="submit" 
        :disabled="loading" 
        aria-busy="loading"
      >
        {{ loading ? "Sending..." : "Send Email" }}
      </button>

      <p 
        v-if="statusMessage" 
        class="mt-3" 
        :class="statusClass"  
        role="status"
        aria-live="polite"
      >
        {{ statusMessage }}
      </p>
    </form>
 </main>
</template>

<script setup>
// Contact Form Logic
import { ref } from "vue"

const email = ref("")
const subject = ref("")
const message = ref("")
const file = ref(null)
const loading = ref(false)
const statusMessage = ref("")
const statusClass = ref("")

// URL of backend function for sendgrid handling email
const functionURL = "https://sendemail-c5melirmcq-uc.a.run.app"

const onFileChange = (e) => {
  const selected = e.target.files[0]
  if (selected) file.value = selected
}

// Submit form data
const sendEmail = async () => {
  loading.value = true
  statusMessage.value = ""
  try {
    let attachmentData = null

    if (file.value) {
      const base64 = await toBase64(file.value)
      attachmentData = {
        content: base64.split(",")[1],
        filename: file.value.name,
        type: file.value.type,
      }
    }

    const formattedMessage = `
 New contact form submission received!

From: ${email.value}

Subject: ${subject.value}

Message:
${message.value}

Submitted on: ${new Date().toLocaleString()}
    `
    const res = await fetch(functionURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "anbuchandran06@gmail.com",
        subject: `[Contact Form] ${subject.value}`,
        text: formattedMessage,
        attachment: attachmentData,
      }),
    })

    const data = await res.json()
    if (res.ok) {
      statusMessage.value = data.message
      statusClass.value = "text-success"
    } else {
      statusMessage.value =  data.message
      statusClass.value = "text-danger"
    }
  } catch (err) {
    console.error("Email send failed:", err)
    statusMessage.value = "Error sending email."
    statusClass.value = "text-danger"
  } finally {
    loading.value = false
  }
}


//convert file to Base64
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
</script>

<style scoped>
form {
  max-width: 600px;
  margin: auto;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 2rem;
  border-radius: 15px;
}
.text-danger {
  color: #b30000;
}
.text-success {
  color: #007a00;
}
input:focus,
textarea:focus,
button:focus {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
label {
  font-weight: 600;
}
</style>
