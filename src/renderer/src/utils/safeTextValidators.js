// src/renderer/src/utils/safeTextValidators.js

// Keyword-keyword SQL berbahaya (sederhana, untuk sisi UI saja)
const SQL_KEYWORD_REGEX =
  /\b(select|update|delete|insert|drop|alter|create|replace|truncate|exec|union|into|from|where)\b/i

// Hanya izinkan: huruf (multi-bahasa), angka, spasi, titik, koma, strip,
// underscore, kurung, dan slash.
// NOTE: butuh dukungan unicode flag "u"
const DEFAULT_ALLOWED_PATTERN = /^[\p{L}0-9 .,_\-()/]*$/u

function baseValidate(value, options = {}) {
  const {
    label = 'Value',
    required = true,
    maxLength = 120,
    allowedPattern = DEFAULT_ALLOWED_PATTERN,
    blockSqlKeyword = true
  } = options

  const v = (value ?? '').trim()

  if (required && !v) {
    return { ok: false, error: `${label} is required.` }
  }

  if (v && v.length > maxLength) {
    return {
      ok: false,
      error: `${label} is too long (max ${maxLength} characters).`
    }
  }

  if (v && !allowedPattern.test(v)) {
    return {
      ok: false,
      error: `${label} contains forbidden characters. Only letters, numbers, spaces, ".", ",", "-", "_", "(", ")", "/" are allowed.`
    }
  }

  if (blockSqlKeyword && v && SQL_KEYWORD_REGEX.test(v)) {
    return {
      ok: false,
      error: `${label} contains forbidden SQL-like keywords (SELECT, DROP, etc.).`
    }
  }

  return { ok: true, error: '' }
}

// =============================
// GENERIC
// =============================

// Untuk nama pemilik / human name
export function validateSafeHumanName(value, label = 'Name') {
  return baseValidate(value, {
    label,
    required: true,
    maxLength: 80
  })
}

// Untuk nama file (boleh sedikit lebih panjang)
export function validateSafeFileName(value, label = 'File name') {
  return baseValidate(value, {
    label,
    required: true,
    maxLength: 120
  })
}

export function validateSafeID(value, label = 'File name') {
  return baseValidate(value, {
    label,
    required: true,
    maxLength: 50
  })
}
// =============================
// KHUSUS Case Management
// =============================

// Case title / name
export function validateSafeCaseTitle(value, label = 'Case name') {
  return baseValidate(value, {
    label,
    required: true,
    maxLength: 120
  })
}

// Case description (boleh kosong, tapi tetap dibersihkan & dicek)
export function validateSafeCaseDescription(value, label = 'Case description') {
  return baseValidate(value, {
    label,
    required: false,
    maxLength: 2000
  })
}

// Nama investigator
export function validateSafeInvestigatorName(value, label = 'Main investigator') {
  return baseValidate(value, {
    label,
    required: false,
    maxLength: 120
  })
}

// Nama agency / institusi
export function validateSafeAgencyName(value, label = 'Agency') {
  return baseValidate(value, {
    label,
    required: false,
    maxLength: 120
  })
}

// Nama work unit
export function validateSafeWorkUnitName(value, label = 'Work unit') {
  return baseValidate(value, {
    label,
    required: false,
    maxLength: 120
  })
}

// Case ID manual: hanya A-Z, a-z, 0-9, dan "-"
export function validateSafeCaseId(value, label = 'Case ID', { required = false } = {}) {
  return baseValidate(value, {
    label,
    required,
    maxLength: 64,
    allowedPattern: /^[A-Za-z0-9-]*$/,
    // ID relatif pendek, jarang mengandung keyword SQL, tapi tetap boleh diblok
    blockSqlKeyword: true
  })
}
