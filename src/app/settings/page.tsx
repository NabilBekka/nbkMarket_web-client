"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import type { User } from "@/context/AuthContext";
import styles from "./page.module.css";

const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const pwTest = {
  length: (v: string) => v.length >= 8,
  uppercase: (v: string) => /[A-Z]/.test(v),
  lowercase: (v: string) => /[a-z]/.test(v),
  number: (v: string) => /[0-9]/.test(v),
  special: (v: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v),
};

function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateInput(iso: string | undefined | null): string {
  if (!iso) return "";
  return formatDate(iso);
}

function translateError(err: string, t: any): string {
  if (err.includes("Incorrect password")) return t.settings.saveError;
  if (err.includes("Email already")) return t.register.emailTaken;
  if (err.includes("Username already") || err.includes("username already")) return t.register.usernameError;
  return err;
}

export default function SettingsPage() {
  const { lang, t } = useLang();
  const { user, accessToken, updateUser, logout } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [showEditPw, setShowEditPw] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<"code" | "done">("code");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPw, setForgotNewPw] = useState("");
  const [showForgotNewPw, setShowForgotNewPw] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const forgotPwChecks = Object.fromEntries(Object.entries(pwTest).map(([k, fn]) => [k, fn(forgotNewPw)]));
  const forgotPwValid = Object.values(forgotPwChecks).every(Boolean);

  const handleForgotPassword = async () => {
    if (!user) return;
    await api.auth.forgotPassword({ email: user.email, lang });
    setForgotCode(""); setForgotNewPw(""); setForgotError(""); setForgotStep("code"); setShowForgotModal(true);
  };

  const handleForgotReset = async () => {
    if (!user || forgotCode.length !== 6 || !forgotPwValid) return;
    setForgotError(""); setForgotLoading(true);
    const res = await api.auth.resetPassword({ email: user.email, code: forgotCode, password: forgotNewPw });
    setForgotLoading(false);
    if (res.error) { setForgotError(t.forgot.codeError); return; }
    setForgotStep("done");
  };

  if (!user || !accessToken) {
    return <main><Header /><div className={styles.container}><p className={styles.notLogged}>Not logged in</p></div><Footer /></main>;
  }

  const fields = [
    { key: "first_name", label: t.settings.firstName, value: user.first_name, editable: true },
    { key: "last_name", label: t.settings.lastName, value: user.last_name, editable: true },
    { key: "username", label: t.settings.username, value: user.username, editable: true },
    { key: "id", label: t.settings.id, value: user.id.slice(0, 8).toUpperCase(), editable: false },
    { key: "birth_date", label: t.settings.birthDate, value: formatDate(user.birth_date), editable: true, type: "date" },
    { key: "email", label: t.settings.email, value: user.email, editable: true, type: "email" },
    { key: "new_password", label: t.settings.password, value: t.settings.passwordHidden, editable: true, type: "password" },
  ];

  const startEdit = (key: string, currentValue: string) => {
    const editVal = key === "new_password" ? "" : key === "birth_date" ? formatDateInput(user.birth_date) : currentValue;
    setEditing(p => ({ ...p, [key]: true }));
    setEditValues(p => ({ ...p, [key]: editVal }));
    setSaveSuccess(false); setSaveError("");
  };
  const cancelEdit = (key: string) => {
    setEditing(p => ({ ...p, [key]: false }));
    setEditValues(p => { const c = { ...p }; delete c[key]; return c; });
  };
  const hasEdits = Object.values(editing).some(Boolean);

  function isFieldValid(key: string): boolean {
    if (!editing[key]) return true;
    const val = editValues[key] || "";
    if (val === "") return false;
    if (key === "first_name" || key === "last_name") return nameRegex.test(val);
    if (key === "username") return val.length >= 3;
    if (key === "birth_date") return dateRegex.test(val);
    if (key === "email") return emailRegex.test(val);
    if (key === "new_password") return Object.values(pwTest).every(fn => fn(val));
    return true;
  }

  const allFieldsValid = Object.keys(editing).filter(k => editing[k]).every(k => isFieldValid(k));
  const pwVal = editValues["new_password"] || "";
  const pwChecks = Object.fromEntries(Object.entries(pwTest).map(([k, fn]) => [k, fn(pwVal)]));

  const handleSave = async () => {
    setSaveSuccess(false); setSaveError("");
    if (!allFieldsValid) return;
    if (!confirmPassword) { setSaveError(t.settings.saveError); return; }
    const updates: Record<string, string> = {};
    for (const [key, isEd] of Object.entries(editing)) {
      if (isEd && editValues[key] !== undefined && editValues[key] !== "") updates[key] = editValues[key];
    }
    if (!Object.keys(updates).length) return;
    setSaveLoading(true);
    const res = await api.auth.updateProfile(accessToken, { password: confirmPassword, updates });
    setSaveLoading(false);
    if (res.error) { setSaveError(translateError(res.error, t)); return; }
    if (res.data?.user) updateUser(res.data.user as User);
    setSaveSuccess(true); setEditing({}); setEditValues({}); setConfirmPassword("");
  };

  const handleDeleteRequest = () => {
    setDeleteError("");
    if (!deletePassword) { setDeleteError(t.settings.deleteError); return; }
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    const res = await api.auth.deleteAccount(accessToken, { password: deletePassword });
    setDeleteLoading(false);
    if (res.error) { setShowDeleteModal(false); setDeleteError(translateError(res.error, t)); return; }
    setShowDeleteModal(false); await logout(); router.push("/");
  };

  return (
    <main>
      <Header />
      <div className={styles.container}>
        <a href="/" className={styles.backLink}>{t.settings.back}</a>
        <h1 className={styles.title}>{t.settings.title}</h1>
        {saveSuccess && <div className={styles.successMsgTop}>✓ {t.settings.saveSuccess}</div>}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.settings.accountInfo}</h2>
          <div className={styles.fieldsList}>
            {fields.map(field => {
              const val = editValues[field.key] || "";
              const valid = isFieldValid(field.key);
              const showErr = editing[field.key] && val.length > 0 && !valid;
              return (
                <div key={field.key} className={styles.fieldRow}>
                  <div className={styles.fieldLeft}>
                    <span className={styles.fieldLabel}>{field.label}</span>
                    {editing[field.key] ? (
                      field.type === "password" ? (
                        <>
                          <div className={styles.passwordWrap}>
                            <input type={showEditPw ? "text" : "password"} className={`${styles.fieldInput} ${showErr ? styles.fieldInputError : ""}`} value={val} onChange={(e) => setEditValues(p => ({ ...p, [field.key]: e.target.value }))} autoFocus />
                            <button type="button" className={styles.eyeBtn} onClick={() => setShowEditPw(!showEditPw)}>{showEditPw ? "🙈" : "👁️"}</button>
                          </div>
                          {val.length > 0 && <div className={styles.checks}>{Object.entries(pwChecks).map(([k, v]) => <span key={k} className={v ? styles.checkOk : styles.checkFail}>{v ? "✓" : "✗"} {t.login.checks[k as keyof typeof t.login.checks]}</span>)}</div>}
                        </>
                      ) : (
                        <>
                          <input type={field.type === "date" ? "date" : field.type === "email" ? "email" : "text"} className={`${styles.fieldInput} ${showErr ? styles.fieldInputError : ""}`} value={val} onChange={(e) => setEditValues(p => ({ ...p, [field.key]: e.target.value }))} placeholder={field.type === "password" ? "••••••••" : ""} autoFocus />
                          {showErr && <p className={styles.fieldErrorText}>
                            {(field.key === "first_name" || field.key === "last_name") ? t.register.nameError
                              : field.type === "email" ? t.register.emailError
                              : field.key === "username" ? t.register.usernameError
                              : ""}
                          </p>}
                        </>
                      )
                    ) : <span className={styles.fieldValue}>{field.value}</span>}
                  </div>
                  {field.editable && (editing[field.key]
                    ? <button className={styles.cancelBtn} onClick={() => cancelEdit(field.key)}>{t.settings.cancel}</button>
                    : <button className={styles.editBtn} onClick={() => startEdit(field.key, field.value)}>{t.settings.edit}</button>)}
                </div>
              );
            })}
          </div>

          {hasEdits && (
            <div className={styles.saveSection}>
              <label className={styles.confirmLabel}>{t.settings.confirmPassword}</label>
              <div className={styles.passwordWrap}>
                <input type={showConfirmPw ? "text" : "password"} className={styles.confirmInput} placeholder={t.settings.confirmPasswordPlaceholder} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPw(!showConfirmPw)}>{showConfirmPw ? "🙈" : "👁️"}</button>
              </div>
              <a href="#" className={styles.forgotLink} onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}>{t.settings.forgotPassword}</a>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saveLoading || !allFieldsValid}>{saveLoading ? "..." : t.settings.save}</button>
              {saveError && <p className={styles.errorMsg}>{saveError}</p>}
            </div>
          )}
        </section>

        <section className={styles.dangerSection}>
          <h2 className={styles.dangerTitle}>{t.settings.deleteAccount}</h2>
          <p className={styles.dangerText}>{t.settings.deleteWarning}</p>
          <label className={styles.confirmLabel}>{t.settings.deletePassword}</label>
          <div className={styles.passwordWrap}>
            <input type={showDeletePw ? "text" : "password"} className={styles.confirmInput} placeholder={t.settings.deletePasswordPlaceholder} value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowDeletePw(!showDeletePw)}>{showDeletePw ? "🙈" : "👁️"}</button>
          </div>
          <a href="#" className={styles.forgotLink} onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}>{t.settings.forgotPassword}</a>
          {deleteError && <p className={styles.errorMsg}>{deleteError}</p>}
          <button className={styles.deleteBtn} onClick={handleDeleteRequest}>{t.settings.deleteBtn}</button>
        </section>
      </div>
      <Footer />

      {showDeleteModal && (
        <div className={styles.overlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{t.settings.deleteModalTitle}</h3>
            <p className={styles.modalText}>{t.settings.deleteModalText}</p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setShowDeleteModal(false)}>{t.settings.deleteModalCancel}</button>
              <button className={styles.modalConfirm} onClick={handleDeleteConfirm} disabled={deleteLoading}>{deleteLoading ? "..." : t.settings.deleteModalConfirm}</button>
            </div>
          </div>
        </div>
      )}

      {showForgotModal && (
        <div className={styles.overlay} onClick={() => setShowForgotModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{t.forgot.title}</h3>
            {forgotStep === "done" ? (
              <div>
                <div className={styles.successMsgTop}>✓ {t.forgot.success}</div>
                <div className={styles.modalActions}><button className={styles.modalCancel} onClick={() => setShowForgotModal(false)}>OK</button></div>
              </div>
            ) : (
              <div>
                <p className={styles.modalText}>{t.forgot.codeSent}</p>
                {forgotError && <p className={styles.errorMsg}>{forgotError}</p>}
                <label className={styles.confirmLabel}>{t.forgot.code}</label>
                <input type="text" className={styles.confirmInput} style={{ textAlign: "center", letterSpacing: "8px", fontSize: "20px", fontWeight: 700 }} placeholder={t.forgot.codePlaceholder} value={forgotCode} onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} inputMode="numeric" />
                <label className={styles.confirmLabel} style={{ marginTop: 16 }}>{t.forgot.newPassword}</label>
                <div className={styles.passwordWrap}>
                  <input type={showForgotNewPw ? "text" : "password"} className={styles.confirmInput} placeholder={t.forgot.newPasswordPlaceholder} value={forgotNewPw} onChange={(e) => setForgotNewPw(e.target.value)} />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowForgotNewPw(!showForgotNewPw)}>{showForgotNewPw ? "🙈" : "👁️"}</button>
                </div>
                {forgotNewPw.length > 0 && (
                  <div className={styles.checks}>
                    {Object.entries(forgotPwChecks).map(([k, v]) => (
                      <span key={k} className={v ? styles.checkOk : styles.checkFail}>{v ? "✓" : "✗"} {t.login.checks[k as keyof typeof t.login.checks]}</span>
                    ))}
                  </div>
                )}
                <div className={styles.modalActions} style={{ marginTop: 16 }}>
                  <button className={styles.modalCancel} onClick={() => setShowForgotModal(false)}>{t.settings.deleteModalCancel}</button>
                  <button className={styles.modalConfirm} onClick={handleForgotReset} disabled={forgotLoading || forgotCode.length !== 6 || !forgotPwValid}>{forgotLoading ? "..." : t.forgot.resetSubmit}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
