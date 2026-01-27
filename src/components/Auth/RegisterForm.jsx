/**
 * Register Form Component
 * Handles user registration with role selection
 */
import { useState, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useForm, validators } from '../../hooks/useForm'
import { Input, PasswordInput, Button, Alert } from '../UI'
import { USER_ROLES, PASSWORD_RULES } from '../../constants'
import { AUTH_MESSAGES, FORM_LABELS, BUTTON_LABELS } from '../../constants/messages'

const ROLE_OPTIONS = [
  { value: USER_ROLES.STUDENT, label: '👨‍🎓 Học sinh', activeClass: 'bg-blue-500 text-white' },
  { value: USER_ROLES.COUNSELOR, label: '👩‍🏫 Tư vấn viên', activeClass: 'bg-green-500 text-white' },
]

export default function RegisterForm({ onSuccess }) {
  const { signUpWithEmail } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { values, errors, handleChange, setValue, validate } = useForm({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: USER_ROLES.STUDENT,
  })

  const validationSchema = {
    fullName: [validators.required('Họ và tên không được để trống')],
    email: [
      validators.required('Email không được để trống'),
      validators.email('Email không hợp lệ'),
    ],
    password: [
      validators.required('Mật khẩu không được để trống'),
      validators.minLength(PASSWORD_RULES.MIN_LENGTH, AUTH_MESSAGES.PASSWORD_TOO_SHORT),
    ],
    confirmPassword: [
      validators.required('Vui lòng xác nhận mật khẩu'),
      validators.match('password', AUTH_MESSAGES.PASSWORD_MISMATCH),
    ],
  }

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError('')

      if (!validate(validationSchema)) return

      setLoading(true)

      const { error: signUpError } = await signUpWithEmail(
        values.email,
        values.password,
        {
          full_name: values.fullName,
          role: values.role,
        }
      )

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
      } else {
        alert(AUTH_MESSAGES.REGISTER_SUCCESS)
        onSuccess?.()
      }
    },
    [values, signUpWithEmail, validate, onSuccess]
  )

  const handleRoleSelect = useCallback(
    (role) => {
      setValue('role', role)
    },
    [setValue]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {FORM_LABELS.ACCOUNT_TYPE}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleRoleSelect(option.value)}
              className={`py-3 rounded-xl font-medium transition-all ${
                values.role === option.value
                  ? option.activeClass
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Input
        name="fullName"
        label={FORM_LABELS.FULL_NAME}
        value={values.fullName}
        onChange={handleChange}
        error={errors.fullName}
        autoComplete="name"
        required
      />

      <Input
        name="email"
        type="email"
        label={FORM_LABELS.EMAIL}
        value={values.email}
        onChange={handleChange}
        error={errors.email}
        autoComplete="email"
        required
      />

      <PasswordInput
        name="password"
        label={FORM_LABELS.PASSWORD}
        value={values.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="new-password"
        required
      />

      <Input
        name="confirmPassword"
        type="password"
        label={FORM_LABELS.CONFIRM_PASSWORD}
        value={values.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        autoComplete="new-password"
        required
      />

      <Alert variant="error">{error}</Alert>

      <Button type="submit" size="xl" loading={loading} disabled={loading}>
        {loading ? AUTH_MESSAGES.REGISTERING : BUTTON_LABELS.REGISTER}
      </Button>
    </form>
  )
}
