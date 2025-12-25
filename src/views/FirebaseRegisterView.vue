<template>
  <main class="container-fluid mt-5" role="main">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <h1 class="text-center" id="registerTitle">Register for SportyTribe</h1>

        <form @submit.prevent="registerUser" class="p-4 shadow rounded bg-white" aria-labelledby="registerTitle">
          <p class="text-muted small">Fields marked with <span class="required">*</span> are mandatory.</p>

          <div class="row mb-3">
            <div class="col-12 col-sm-6">
              <label for="email" class="form-label">Email <span class="required">*</span></label>
              <input type="email" class="form-control" id="email"
                required
                aria-required="true"
                v-model="formData.email"
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$"
                aria-describedby="emailHelp"
              />
              <small id="emailHelp" class="form-text text-muted">
                Enter a valid email address
              </small>
            </div>

            <div class="col-12 col-sm-6 mt-3 mt-sm-0">
              <label for="password" class="form-label">Password <span class="required">*</span></label>
              <input type="password"  class="form-control" id="password"
                required
                aria-required="true"
                @blur="() => validatePassword(true)"
                @input="() => validatePassword(false)"
                v-model="formData.password"
                aria-describedby="passwordError"
              />
              <div v-if="errors.password" id="passwordError" class="text-danger small mt-1" role="alert">
                {{ errors.password }}
              </div>
            </div>

            <div class="col-12 col-sm-6 mt-3 mt-sm-0">
              <label for="gender" class="form-label">Gender <span class="required">*</span></label>
              <select class="form-select" id="gender"
                required
                aria-required="true"
                v-model="formData.gender"
                @change="validateGender(true)"
                aria-describedby="genderError"
              >
                <option value="">-- Select Gender --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div v-if="errors.gender" id="genderError" class="text-danger small mt-1" role="alert">
                {{ errors.gender }}
              </div>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-12 col-sm-6">
              <div class="form-check">
                <input type="checkbox" class="form-check-input" id="isAustralian"
                  v-model="formData.isAustralian"
                  @change="validateResident(true)"
                  aria-describedby="residentError"
                />
                <label class="form-check-label" for="isAustralian">
                  Australian Resident?
                </label>
              </div>
              <div v-if="errors.resident" id="residentError" class="text-danger small" role="alert">{{ errors.resident }}</div>
            </div>
          </div>

          <div class="d-flex justify-content-center gap-2">
            <button type="submit" class="btn btn-success">Register</button>
            <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
          </div>
        </form>

        <div v-if="isRegistered" class="alert alert-success text-center p-4 shadow rounded mt-3"  role="status"
          aria-live="polite">
          Registration successful! Please Login! <router-link to="/firelogin">Login</router-link>.
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
  gender: "",
  isAustralian: false
})

const errors = ref({
  password: null,
  gender: null,
  resident: null
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

const validateResident = (blur) => {
  if (!formData.value.isAustralian) {
    if (blur) errors.value.resident = "You must be an Australian resident."
  } else {
    errors.value.resident = null
  }
}

const registerUser = async () => {
  validatePassword(true)
  validateGender(true)
  validateResident(true)

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
        isAustralian: formData.value.isAustralian,
        role: "user"
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
    gender: "",
    isAustralian: false
  }
  errors.value = { password: null, gender: null, resident: null }
}

</script>

<style>
.form-control + .text-danger {
  min-height: 20px;
  display: block;
}

.required {
  color: red;
  margin-left: 2px;
}
input:focus,
select:focus,
button:focus {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
</style>