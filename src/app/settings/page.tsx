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

export default function SettingsPage() {
  const { t } = useLang();
  const { user, accessToken, updateUser, logout } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (!user || !accessToken) {
    return (
      <main>
        <Header />
        <div className={styles.container}>
          <p className={styles.notLogged}>Not logged in</p>
        </div>
        <Footer />
      </main>
    );
  }

  const fields = [
    { key: "first_name", label: t.settings.firstName, value: user.first_name, editable: true },
    { key: "last_name", label: t.settings.lastName, value: user.last_name, editable: true },
    { key: "username", label: t.settings.username, value: user.username, editable: true },
    { key: "id", label: t.settings.id, value: user.id.slice(0, 8).toUpperCase(), editable: false },
    { key: "birth_date", label: t.settings.birthDate, value: user.birth_date || "—", editable: true, type: "date" },
    { key: "email", label: t.settings.email, value: user.email, editable: true, type: "email" },
    { key: "new_password", label: t.settings.password, value: t.settings.passwordHidden, editable: true, type: "password" },
  ];

  const startEdit = (key: string, currentValue: string) => {
    setEditing((prev) => ({ ...prev, [key]: true }));
    setEditValues((prev) => ({ ...prev, [key]: key === "new_password" ? "" : currentValue }));
    setSaveSuccess(false);
    setSaveError("");
  };

  const cancelEdit = (key: string) => {
    setEditing((prev) => ({ ...prev, [key]: false }));
    setEditValues((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const hasEdits = Object.values(editing).some(Boolean);

  const handleSave = async () => {
    setSaveSuccess(false);
    setSaveError("");

    if (!confirmPassword) {
      setSaveError(t.settings.saveError);
      return;
    }

    // Build updates object from edited fields only
    const updates: Record<string, string> = {};
    for (const [key, isEditing] of Object.entries(editing)) {
      if (isEditing && editValues[key] !== undefined && editValues[key] !== "") {
        updates[key] = editValues[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      setSaveError(t.settings.saveError);
      return;
    }

    setSaveLoading(true);
    const res = await api.auth.updateProfile(accessToken, {
      password: confirmPassword,
      updates,
    });
    setSaveLoading(false);

    if (res.error) {
      setSaveError(res.error === "Incorrect password" ? t.settings.saveError : res.error);
      return;
    }

    if (res.data?.user) {
      updateUser(res.data.user as User);
    }

    setSaveSuccess(true);
    setEditing({});
    setEditValues({});
    setConfirmPassword("");
  };

  const handleDeleteRequest = () => {
    setDeleteError("");
    if (!deletePassword) {
      setDeleteError(t.settings.deleteError);
      return;
    }
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    const res = await api.auth.deleteAccount(accessToken, { password: deletePassword });
    setDeleteLoading(false);

    if (res.error) {
      setShowDeleteModal(false);
      setDeleteError(res.error === "Incorrect password" ? t.settings.deleteError : res.error);
      return;
    }

    setShowDeleteModal(false);
    await logout();
    router.push("/");
  };

  return (
    <main>
      <Header />

      <div className={styles.container}>
        <a href="/" className={styles.backLink}>{t.settings.back}</a>
        <h1 className={styles.title}>{t.settings.title}</h1>

        {/* Account info */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.settings.accountInfo}</h2>

          <div className={styles.fieldsList}>
            {fields.map((field) => (
              <div key={field.key} className={styles.fieldRow}>
                <div className={styles.fieldLeft}>
                  <span className={styles.fieldLabel}>{field.label}</span>
                  {editing[field.key] ? (
                    <input
                      type={field.type === "password" ? "password" : field.type === "date" ? "date" : "text"}
                      className={styles.fieldInput}
                      value={editValues[field.key] || ""}
                      onChange={(e) =>
                        setEditValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.type === "password" ? "••••••••" : ""}
                      autoFocus
                    />
                  ) : (
                    <span className={styles.fieldValue}>{field.value}</span>
                  )}
                </div>
                {field.editable && (
                  <div>
                    {editing[field.key] ? (
                      <button className={styles.cancelBtn} onClick={() => cancelEdit(field.key)}>
                        {t.settings.cancel}
                      </button>
                    ) : (
                      <button className={styles.editBtn} onClick={() => startEdit(field.key, field.value)}>
                        {t.settings.edit}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {hasEdits && (
            <div className={styles.saveSection}>
              <label className={styles.confirmLabel}>{t.settings.confirmPassword}</label>
              <div className={styles.passwordWrap}>
                <input
                  type={showConfirmPw ? "text" : "password"}
                  className={styles.confirmInput}
                  placeholder={t.settings.confirmPasswordPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirmPw(!showConfirmPw)}>
                  {showConfirmPw ? "🙈" : "👁️"}
                </button>
              </div>
              <a href="#" className={styles.forgotLink} onClick={(e) => e.preventDefault()}>
                {t.settings.forgotPassword}
              </a>

              <button className={styles.saveBtn} onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? "..." : t.settings.save}
              </button>

              {saveSuccess && <p className={styles.successMsg}>✓ {t.settings.saveSuccess}</p>}
              {saveError && <p className={styles.errorMsg}>{saveError}</p>}
            </div>
          )}
        </section>

        {/* Delete account */}
        <section className={styles.dangerSection}>
          <h2 className={styles.dangerTitle}>{t.settings.deleteAccount}</h2>
          <p className={styles.dangerText}>{t.settings.deleteWarning}</p>

          <label className={styles.confirmLabel}>{t.settings.deletePassword}</label>
          <div className={styles.passwordWrap}>
            <input
              type={showDeletePw ? "text" : "password"}
              className={styles.confirmInput}
              placeholder={t.settings.deletePasswordPlaceholder}
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowDeletePw(!showDeletePw)}>
              {showDeletePw ? "🙈" : "👁️"}
            </button>
          </div>
          <a href="#" className={styles.forgotLink} onClick={(e) => e.preventDefault()}>
            {t.settings.forgotPassword}
          </a>

          {deleteError && <p className={styles.errorMsg}>{deleteError}</p>}

          <button className={styles.deleteBtn} onClick={handleDeleteRequest}>
            {t.settings.deleteBtn}
          </button>
        </section>
      </div>

      <Footer />

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className={styles.overlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{t.settings.deleteModalTitle}</h3>
            <p className={styles.modalText}>{t.settings.deleteModalText}</p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setShowDeleteModal(false)}>
                {t.settings.deleteModalCancel}
              </button>
              <button className={styles.modalConfirm} onClick={handleDeleteConfirm} disabled={deleteLoading}>
                {deleteLoading ? "..." : t.settings.deleteModalConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
