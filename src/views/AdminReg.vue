<template>
  <main id="main-content" class="container-fluid mt-5" role="main">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <h1 class="text-center"> Admin Registration</h1>

        <form @submit.prevent="registerUser" class="p-4 shadow rounded bg-white" aria-describedby="formInstructions">
          <p id="formInstructions" class="text-muted small">Fields marked with <span class="required">*</span> are mandatory.</p>

          <div class="row mb-3">
            <div class="col-12 col-sm-6">
              <label for="email" class="form-label">Email <span class="required">*</span></label>
              <input type="email" class="form-control" id="email"
                required
                aria-required="true"
                v-model="formData.email"
                aria-describedby="emailHelp"
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$"
              />
              <div id="emailHelp" class="form-text">Enter a valid email address</div>
            </div>

            <div class="col-12 col-sm-6 mt-3 mt-sm-0">
              <label for="password" class="form-label">Password <span class="required">*</span></label>
              <input type="password"  class="form-control" id="password"
                required
                aria-required="true"
                @blur="() => validatePassword(true)"
                @input="() => validatePassword(false)"
                v-model="formData.password"
              />
              <div v-if="errors.password" class="text-danger small mt-1" aria-live="assertive"
>
                {{ errors.password }}

                
              </div>
            </div>

            <div class="col-12 col-sm-6 mt-3 mt-sm-0">
              <label for="gender" class="form-label">Gender <span class="required">*</span></label>
              <select class="form-select" id="gender"
                required
                aria-required="true"
                v-model="formData.gender"
                aria-describedby="genderError"
                @change="validateGender(true)"
              >
                <option value="">-- Select Gender --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div v-if="errors.gender" id="genderError" class="text-danger small mt-1" aria-live="assertive">
                {{ errors.gender }}
              </div>
            </div>
          </div>


          <div class="d-flex justify-content-center gap-2">
            <button type="submit" class="btn btn-success">Register</button>
            <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
          </div>
        </form>

        <div v-if="isRegistered" class="alert alert-success text-center p-4 shadow rounded mt-3" role="status"
          aria-live="polite">
          Registration successful! Please Login! <router-link to="/adminlogin" aria-label="Go to admin login page">Login</router-link>.
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "vue-router"
import { getFirestore, doc, setDoc } from "firebase/firestore"

 const router = useRouter()
 const auth = getAuth()
const db = getFirestore()



const formData = ref({
  email: "",
  password: "",
  gender: ""
})

const errors = ref({
  password: null,
  gender: null

})

const isRegistered = ref(false)

const validatePassword = (blur) => {
  const password = formData.value.password
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (password.length < minLength) {
    if (blur) errors.value.password = `Password must be at least ${minLength} characters long.`
  } else if (!hasUppercase) {
    if (blur) errors.value.password = "Password must contain at least one uppercase letter."
  } else if (!hasLowercase) {
    if (blur) errors.value.password = "Password must contain at least one lowercase letter."
  } else if (!hasNumber) {
    if (blur) errors.value.password = "Password must contain at least one number."
  } else if (!hasSpecialChar) {
    if (blur) errors.value.password = "Password must contain at least one special character."
  } else {
    errors.value.password = null
  }
}

const validateGender = (blur) => {
  if (!formData.value.gender) {
    if (blur) errors.value.gender = "Please select your gender."
  } else {
    errors.value.gender = null
  }
}

const registerUser = async () => {
  validatePassword(true)
  validateGender(true)
  
  if (!errors.value.password && !errors.value.gender && !errors.value.resident) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.value.email,
        formData.value.password
      )

      const user = userCredential.user

      await setDoc(doc(db, "users", user.uid), {
        email: formData.value.email,
        gender: formData.value.gender,
        role: "admin"
      })

      isRegistered.value = true
      clearForm()
    } catch (error) {
      console.log("Error:", error.code, error.message)
    }
  }
}


const clearForm = () => {
  formData.value = {
    email: "",
    password: "",
    gender: ""
  }
  errors.value = { password: null, gender: null}
}

</script>

<style>
.form-control + .text-danger {
  min-height: 20px;
  display: block;
}


.required {
  color: #b30000;
  margin-left: 2px;
}
button:focus,
input:focus,
select:focus,
a:focus {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
</style>


