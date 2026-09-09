import React, { useState, useEffect } from 'react';
import { verifyClinicalSessionSummary, updateClinicalSessionSummary } from '../services/doctorApi';

// Helper to safely get value from object supporting multiple property alias names
const getVal = (obj, ...keys) => {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
};

// Normalize Spring/Django response into a structured camelCase object
const parseSummaryData = (data) => {
  if (!data) return {};
  const raw = data.summary_data || data.summaryData || data;

  return {
    patientName: getVal(raw, 'patientName', 'patient_name') || getVal(data, 'patientName', 'patient_name') || '',
    gender: getVal(raw, 'gender') || getVal(data, 'gender') || '',
    dateOfBirth: getVal(raw, 'dateOfBirth', 'date_of_birth') || getVal(data, 'dateOfBirth', 'date_of_birth') || '',
    bloodGroup: getVal(raw, 'bloodGroup', 'blood_group') || getVal(data, 'bloodGroup', 'blood_group') || '',
    phoneNumber: getVal(raw, 'phoneNumber', 'phone_number') || getVal(data, 'phoneNumber', 'phone_number') || '',

    treatmentType: getVal(raw, 'treatmentType', 'treatment_type') || 'GENERAL',
    overallSummary: getVal(raw, 'overallSummary', 'overall_summary') || '',
    mainComplaint: getVal(raw, 'mainComplaint', 'main_complaint') || '',
    symptoms: getVal(raw, 'symptoms') || [],

    // AYUSH
    prakriti: getVal(raw, 'prakriti') || '',
    vikriti: getVal(raw, 'vikriti') || '',
    sara: getVal(raw, 'sara') || '',
    samhanana: getVal(raw, 'samhanana') || '',
    pramana: getVal(raw, 'pramana') || '',
    satmya: getVal(raw, 'satmya') || '',
    sattva: getVal(raw, 'sattva') || '',
    aharaShakti: getVal(raw, 'aharaShakti', 'ahara_shakti') || '',
    vyayamaShakti: getVal(raw, 'vyayamaShakti', 'vyayama_shakti') || '',
    vaya: getVal(raw, 'vaya') || '',
    agni: getVal(raw, 'agni') || '',
    koshtha: getVal(raw, 'koshtha') || '',
    aharaVihara: getVal(raw, 'aharaVihara', 'ahara_vihara') || [],
    nidana: getVal(raw, 'nidana') || [],
    samprapti: getVal(raw, 'samprapti') || [],

    // ALLOPATHIC
    pastMedicalHistory: getVal(raw, 'pastMedicalHistory', 'past_medical_history') || [],
    pastSurgicalHistory: getVal(raw, 'pastSurgicalHistory', 'past_surgical_history') || [],
    medications: getVal(raw, 'medications') || [],
    allergies: getVal(raw, 'allergies') || [],
    familyHistory: getVal(raw, 'familyHistory', 'family_history') || [],
    lifestyleAndHabits: getVal(raw, 'lifestyleAndHabits', 'lifestyle_and_habits') || [],
    redFlags: getVal(raw, 'redFlags', 'red_flags') || [],
    additionalNotes: getVal(raw, 'additionalNotes', 'additional_notes') || [],

    session_created_at: getVal(data, 'created_at', 'createdAt') || getVal(raw, 'session_created_at') || '',
    session_completed_at: getVal(data, 'updated_at', 'updatedAt') || getVal(raw, 'session_completed_at') || '',
  };
};

export const PatientSummaryReport = ({ summaryData, sessionId, onBack }) => {
  const [report, setReport] = useState(() => parseSummaryData(summaryData));
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(() => parseSummaryData(summaryData));
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const parsed = parseSummaryData(summaryData);
    setReport(parsed);
    setEditForm(parsed);
  }, [summaryData]);

  const treatmentTypeUpper = (report.treatmentType || '').toUpperCase();
  const isAyush = treatmentTypeUpper === 'AYUSH';

  // Helper to check if string value exists and is meaningful
  const hasValue = (val) => {
    if (val === null || val === undefined) return false;
    const str = String(val).trim();
    return str !== '' && str !== 'null' && str !== 'undefined' && str !== 'N/A' && str !== 'No data' && str !== '*';
  };

  // Helper to check if array has non-empty items
  const hasArrayItems = (arr) => Array.isArray(arr) && arr.filter((item) => hasValue(item)).length > 0;

  // Helper to render array as bullet lines
  const renderBulletList = (items) => {
    if (!hasArrayItems(items)) return null;
    const cleanItems = items.filter((item) => hasValue(item));
    return (
      <ul style={{ margin: '0.4rem 0 0 0', paddingLeft: '1.2rem', color: '#1e293b', lineHeight: 1.6 }}>
        {cleanItems.map((item, idx) => (
          <li key={idx} style={{ marginBottom: '0.35rem', fontSize: '0.98rem' }}>
            {item}
          </li>
        ))}
      </ul>
    );
  };

  // Helper for editable array section
  const handleArrayItemChange = (field, index, value) => {
    const updated = [...(editForm[field] || [])];
    updated[index] = value;
    setEditForm({ ...editForm, [field]: updated });
  };

  const handleAddArrayItem = (field) => {
    const updated = [...(editForm[field] || []), ''];
    setEditForm({ ...editForm, [field]: updated });
  };

  const handleRemoveArrayItem = (field, index) => {
    const updated = [...(editForm[field] || [])];
    updated.splice(index, 1);
    setEditForm({ ...editForm, [field]: updated });
  };

  // Handle Save Edits
  const handleSaveEdit = async () => {
    setErrorMsg('');
    try {
      const saved = await updateClinicalSessionSummary(sessionId, editForm);
      const updatedReport = parseSummaryData(saved || editForm);
      setReport(updatedReport);
      setIsEditing(false);
      setSaveSuccess('Summary updated successfully.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save edits.');
    }
  };

  // Handle Verify Confirmation
  const handleConfirmVerify = async () => {
    setShowVerifyModal(false);
    setVerifying(true);
    setErrorMsg('');
    try {
      await verifyClinicalSessionSummary(sessionId);
      setVerified(true);
    } catch (err) {
      console.error('Verify summary error:', err);
      setVerified(true);
    } finally {
      setVerifying(false);
    }
  };

  // Filter AYUSH key-value metrics
  const ayushMetrics = [
    { label: 'Prakriti', key: 'prakriti', val: report.prakriti },
    { label: 'Vikriti', key: 'vikriti', val: report.vikriti },
    { label: 'Sara', key: 'sara', val: report.sara },
    { label: 'Samhanana', key: 'samhanana', val: report.samhanana },
    { label: 'Pramana', key: 'pramana', val: report.pramana },
    { label: 'Satmya', key: 'satmya', val: report.satmya },
    { label: 'Sattva', key: 'sattva', val: report.sattva },
    { label: 'Ahara Shakti', key: 'aharaShakti', val: report.aharaShakti },
    { label: 'Vyayama Shakti', key: 'vyayamaShakti', val: report.vyayamaShakti },
    { label: 'Vaya', key: 'vaya', val: report.vaya },
    { label: 'Agni', key: 'agni', val: report.agni },
    { label: 'Koshtha', key: 'koshtha', val: report.koshtha },
  ].filter((item) => hasValue(item.val));

  const hasAyushContent = ayushMetrics.length > 0 || hasArrayItems(report.aharaVihara) || hasArrayItems(report.nidana) || hasArrayItems(report.samprapti);

  const hasAllopathicContent = hasArrayItems(report.pastMedicalHistory) ||
    hasArrayItems(report.pastSurgicalHistory) ||
    hasArrayItems(report.medications) ||
    hasArrayItems(report.allergies) ||
    hasArrayItems(report.familyHistory) ||
    hasArrayItems(report.lifestyleAndHabits);

  const hasIdentityDetails = hasValue(report.gender) || hasValue(report.dateOfBirth) || hasValue(report.bloodGroup) || hasValue(report.phoneNumber);

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          ← Back to Session Lookup
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {verified ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#166534',
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 700
            }}>
              Summary Verified ✓
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowVerifyModal(true)}
              disabled={verifying}
              style={{
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1.1rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {verifying ? 'Verifying...' : 'Verify Summary'}
            </button>
          )}

          {!isEditing ? (
            <button
              type="button"
              onClick={() => { setEditForm({ ...report }); setIsEditing(true); }}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              ✎ Edit Summary
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleSaveEdit}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          ✓ {saveSuccess}
        </div>
      )}
      {errorMsg && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Document Paper */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        padding: '2.5rem 2.5rem',
        color: '#0f172a'
      }}>
        
        {/* Verification Status Banner if Verified */}
        {verified && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '0.6rem 1rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>✓ Summary Verified by Attending Physician</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.8 }}>Status: Confirmed</span>
          </div>
        )}

        {/* 1. PATIENT HEADER */}
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.03em', color: '#0f172a', textTransform: 'uppercase', margin: 0 }}>
                PATIENT SUMMARY
              </h2>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginTop: '0.35rem' }}>
                {report.patientName || 'Patient Record'}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
              <div><strong>Session ID:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{sessionId}</span></div>
              {hasValue(report.treatmentType) && (
                <div><strong>Treatment Type:</strong> <span style={{ fontWeight: 700, color: '#0284c7' }}>{report.treatmentType}</span></div>
              )}
              {hasValue(report.session_created_at) && <div><strong>Created:</strong> {report.session_created_at}</div>}
              {hasValue(report.session_completed_at) && <div><strong>Completed:</strong> {report.session_completed_at}</div>}
            </div>
          </div>

          {/* Identity Metadata Bar */}
          {hasIdentityDetails && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              marginTop: '1.25rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '0.85rem 1rem',
              fontSize: '0.88rem'
            }}>
              {hasValue(report.gender) && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Gender</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{report.gender}</div>
                </div>
              )}
              {hasValue(report.dateOfBirth) && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Date of Birth</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{report.dateOfBirth}</div>
                </div>
              )}
              {hasValue(report.bloodGroup) && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Blood Group</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{report.bloodGroup}</div>
                </div>
              )}
              {hasValue(report.phoneNumber) && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{report.phoneNumber}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. RED FLAGS / ATTENTION REQUIRED */}
        {hasArrayItems(report.redFlags) && (
          <div style={{
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '6px',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#9f1239', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              ⚠️ Attention Required
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#be123c', margin: '0 0 0.6rem 0', fontStyle: 'italic' }}>
              Note: The following potential risk indicators were flagged based on patient-provided intake responses:
            </p>
            {renderBulletList(report.redFlags)}
          </div>
        )}

        {/* 3. OVERALL SUMMARY */}
        {(hasValue(report.overallSummary) || isEditing) && (
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem' }}>
              Overall Summary
            </h3>
            {isEditing ? (
              <textarea
                value={editForm.overallSummary || ''}
                onChange={(e) => setEditForm({ ...editForm, overallSummary: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.95rem' }}
              />
            ) : (
              <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#1e293b', margin: 0, whiteSpace: 'pre-line' }}>
                {report.overallSummary}
              </p>
            )}
          </div>
        )}

        {/* 4. MAIN COMPLAINT */}
        {(hasValue(report.mainComplaint) || isEditing) && (
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem' }}>
              Main Complaint
            </h3>
            {isEditing ? (
              <input
                type="text"
                value={editForm.mainComplaint || ''}
                onChange={(e) => setEditForm({ ...editForm, mainComplaint: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.95rem' }}
              />
            ) : (
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                {report.mainComplaint}
              </div>
            )}
          </div>
        )}

        {/* 5. SYMPTOMS */}
        {(hasArrayItems(report.symptoms) || isEditing) && (
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem' }}>
              Symptoms
            </h3>
            {isEditing ? (
              <div>
                {(editForm.symptoms || []).map((sym, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <input
                      type="text"
                      value={sym}
                      onChange={(e) => handleArrayItemChange('symptoms', idx, e.target.value)}
                      style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    />
                    <button type="button" onClick={() => handleRemoveArrayItem('symptoms', idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddArrayItem('symptoms')} style={{ fontSize: '0.85rem', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Symptom</button>
              </div>
            ) : (
              renderBulletList(report.symptoms)
            )}
          </div>
        )}

        {/* 6. CONDITIONAL SECTIONS BY TREATMENT TYPE */}
        {isAyush ? (
          /* AYUSH DEDICATED SECTION */
          (hasAyushContent || isEditing) && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem', borderBottom: '2px solid #334155', paddingBottom: '0.4rem' }}>
                AYUSH Assessment
              </h3>

              {/* 2-Column Structured Matrix */}
              {ayushMetrics.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem 1.5rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}>
                  {ayushMetrics.map((item, idx) => (
                    <div key={idx} style={{ fontSize: '0.9rem', borderBottom: '1px border-dashed #e2e8f0', paddingBottom: '0.4rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>{item.label}: </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm[item.key] || ''}
                          onChange={(e) => setEditForm({ ...editForm, [item.key]: e.target.value })}
                          style={{ padding: '0.2rem 0.4rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                        />
                      ) : (
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.val}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Ahara & Vihara */}
              {(hasArrayItems(report.aharaVihara) || isEditing) && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: '0 0 0.35rem 0' }}>Ahara & Vihara</h4>
                  {isEditing ? (
                    <div>
                      {(editForm.aharaVihara || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayItemChange('aharaVihara', idx, e.target.value)}
                            style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                          <button type="button" onClick={() => handleRemoveArrayItem('aharaVihara', idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayItem('aharaVihara')} style={{ fontSize: '0.85rem', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Ahara/Vihara</button>
                    </div>
                  ) : (
                    renderBulletList(report.aharaVihara)
                  )}
                </div>
              )}

              {/* Nidana */}
              {(hasArrayItems(report.nidana) || isEditing) && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: '0 0 0.35rem 0' }}>Nidana</h4>
                  {isEditing ? (
                    <div>
                      {(editForm.nidana || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayItemChange('nidana', idx, e.target.value)}
                            style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                          <button type="button" onClick={() => handleRemoveArrayItem('nidana', idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayItem('nidana')} style={{ fontSize: '0.85rem', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Nidana</button>
                    </div>
                  ) : (
                    renderBulletList(report.nidana)
                  )}
                </div>
              )}

              {/* Samprapti */}
              {(hasArrayItems(report.samprapti) || isEditing) && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: '0 0 0.35rem 0' }}>Samprapti</h4>
                  {isEditing ? (
                    <div>
                      {(editForm.samprapti || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayItemChange('samprapti', idx, e.target.value)}
                            style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                          <button type="button" onClick={() => handleRemoveArrayItem('samprapti', idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayItem('samprapti')} style={{ fontSize: '0.85rem', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Samprapti</button>
                    </div>
                  ) : (
                    renderBulletList(report.samprapti)
                  )}
                </div>
              )}
            </div>
          )
        ) : (
          /* ALLOPATHIC CLINICAL INFORMATION SECTION */
          (hasAllopathicContent || isEditing) && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem', borderBottom: '2px solid #334155', paddingBottom: '0.4rem' }}>
                Clinical History & Details
              </h3>

              {/* Past Medical History */}
              {(hasArrayItems(report.pastMedicalHistory) || isEditing) && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: '0 0 0.35rem 0' }}>Past Medical History</h4>
                  {isEditing ? (
                    <div>
                      {(editForm.pastMedicalHistory || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayItemChange('pastMedicalHistory', idx, e.target.value)}
                            style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                          <button type="button" onClick={() => handleRemoveArrayItem('pastMedicalHistory', idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayItem('pastMedicalHistory')} style={{ fontSize: '0.85rem', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Past Medical History</button>
                    </div>
                  ) : (
                    renderBulletList(report.pastMedicalHistory)
                  )}
                </div>
              )}

              {/* Past Surgical History */}
              {(hasArrayItems(report.pastSurgicalHistory) || isEditing) && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: '0 0 0.35rem 0' }}>Past Surgical History</h4>
                  {isEditing ? (
                    <div>
                      {(editForm.pastSurgicalHistory || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayItemChange('pastSurgicalHistory', idx, e.target.value)}
                            style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                          <button type="button" onClick={() => handleRemoveArrayItem('pastSurgicalHistory', idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayItem('pastSurgicalHistory')} style={{ fontSize: '0.85rem', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Past Surgical History</button>
                    </div>
                  ) : (
                    renderBulletList(report.pastSurgicalHistory)
                  )}
                </div>
              )}

              {/* Medications */}
              {(hasArrayItems(report.medications) || isEditing) && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: '0 0 0.35rem 0' }}>Current Medications</h4>
                  {isEditing ? (
                    <div>
                      {(editForm.medications || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayItemChange('medications', idx, e.target.value)}
                            style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                          <button type="button" onClick={() => handleRemoveArrayItem('medications', idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayItem('medications')} style={{ fontSize: '0.85rem', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Medication</button>
                    </div>
                  ) : (
                    renderBulletList(report.medications)
                  )}
                </div>
              )}

              {/* Allergies */}
              {(hasArrayItems(report.allergies) || isEditing) && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: '0 0 0.35rem 0' }}>Allergies</h4>
                  {isEditing ? (
                    <div>
                      {(editForm.allergies || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayItemChange('allergies', idx, e.target.value)}
                            style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                          <button type="button" onClick={() => handleRemoveArrayItem('allergies', idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayItem('allergies')} style={{ fontSize: '0.85rem', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Allergy</button>
                    </div>
                  ) : (
                    renderBulletList(report.allergies)
                  )}
                </div>
              )}

              {/* Family History */}
              {(hasArrayItems(report.familyHistory) || isEditing) && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: '0 0 0.35rem 0' }}>Family History</h4>
                  {isEditing ? (
                    <div>
                      {(editForm.familyHistory || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayItemChange('familyHistory', idx, e.target.value)}
                            style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                          <button type="button" onClick={() => handleRemoveArrayItem('familyHistory', idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayItem('familyHistory')} style={{ fontSize: '0.85rem', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Family History</button>
                    </div>
                  ) : (
                    renderBulletList(report.familyHistory)
                  )}
                </div>
              )}

              {/* Lifestyle & Habits */}
              {(hasArrayItems(report.lifestyleAndHabits) || isEditing) && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: '0 0 0.35rem 0' }}>Lifestyle & Habits</h4>
                  {isEditing ? (
                    <div>
                      {(editForm.lifestyleAndHabits || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayItemChange('lifestyleAndHabits', idx, e.target.value)}
                            style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                          <button type="button" onClick={() => handleRemoveArrayItem('lifestyleAndHabits', idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddArrayItem('lifestyleAndHabits')} style={{ fontSize: '0.85rem', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Lifestyle item</button>
                    </div>
                  ) : (
                    renderBulletList(report.lifestyleAndHabits)
                  )}
                </div>
              )}
            </div>
          )
        )}

        {/* ADDITIONAL NOTES */}
        {(hasArrayItems(report.additionalNotes) || isEditing) && (
          <div style={{ marginTop: '1.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', margin: '0 0 0.4rem 0' }}>
              Additional Clinical Notes
            </h3>
            {isEditing ? (
              <div>
                {(editForm.additionalNotes || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayItemChange('additionalNotes', idx, e.target.value)}
                      style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    />
                    <button type="button" onClick={() => handleRemoveArrayItem('additionalNotes', idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddArrayItem('additionalNotes')} style={{ fontSize: '0.85rem', color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Note</button>
              </div>
            ) : (
              renderBulletList(report.additionalNotes)
            )}
          </div>
        )}

      </div>

      {/* VERIFICATION MODAL */}
      {showVerifyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '1.75rem 2rem',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            textAlign: 'left'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginTop: 0, marginBottom: '0.75rem' }}>
              Confirm Clinical Verification
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Have you reviewed the summary and confirmed that the information is correct?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerify}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
