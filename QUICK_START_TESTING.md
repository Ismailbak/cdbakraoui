# Quick Start - Testing Medical Forms Integration

## 🚀 Launch Instructions

### 1. Terminal 1 - Backend Server
```powershell
cd "C:\Users\DELL\OneDrive - Ecole Marocaine des Sciences de l'Ingénieur\Bureau\IA-medical\backend"
python -m uvicorn app.main:app --reload
# Expected: ✓ Uvicorn running on http://127.0.0.1:8000
```

### 2. Terminal 2 - Frontend Server
```powershell
cd "C:\Users\DELL\OneDrive - Ecole Marocaine des Sciences de l'Ingénieur\Bureau\IA-medical\frontend\web"
npm start
# Expected: ✓ React running on http://localhost:3000
```

### 3. Browser - Test Application
1. Open http://localhost:3000
2. Login with credentials
3. Navigate to Medical Acts → Create New Act

## 📋 Test Scenario: Complete Medical Form Submission

### Step 1: Select Patient
- Search for patient by name or IPP
- Click to select patient
- Confirm date field populated

### Step 2: Select Care Type
- Available care types should load from database
- Options: RIC, RD, OS, ECHO, GESTE, SEANCES, DXA
- Select any care type (e.g., "RIC")

### Step 3: Medical Form (NEW!)
**This is where the new forms appear:**

1. Form type dropdown should appear
2. Available forms auto-populate based on care type
3. Select a form (e.g., "Rhumatismes Inflammatoires Chroniques")
4. Form component renders with collapsible sections
5. Fill in form fields:
   - CRP Value: 25.5
   - ESR Value: 45
   - DAS28 Score: 4.2
   - Tender Joints: 6
   - Swollen Joints: 4
   - Fever Present: No
   - Clinical Notes: "Patient responding well to treatment"
6. Click Submit button
7. **Verify**: Form submitted to API (check browser console Network tab)
8. Confirm response shows form ID (e.g., `{"id": 42, "created_at": "...", ...}`)

### Step 4: Clinical Details
- Continue with diagnosis, doctor, etc. as usual
- Complete remaining steps
- Final submission saves everything

## 🧪 Individual Form Tests

Test each form type independently:

### Test 1: Inflammatory Rheumatism (RIC)
- Form: `FormCsRic`
- Fields: CRP, ESR, DAS28, joint counts, medications
- API: `POST /forms/cs-ric`

### Test 2: Bone Disease (OS)
- Form: `FormCsOs`
- Fields: DXA scores, FRAX, Vitamin D, fall risk
- API: `POST /forms/cs-os`

### Test 3: Ultrasound (ECHO)
- Form: `FormCsEcho`
- Fields: Anatomical regions, synovitis, effusion, doppler
- API: `POST /forms/cs-echo`

### Test 4: Technical Procedures (GESTE)
- Form: `FormCsGeste`
- Fields: Procedure type, site, guidance, anesthesia, complications
- API: `POST /forms/cs-geste`

### Test 5: Therapy Sessions (SEANCES)
- Form: `FormCsSeances`
- Fields: Session type, pain scores, functional improvement
- API: `POST /forms/cs-seances`

### Test 6: DEXA Scan (DXA)
- Form: `FormCsDxa`
- Fields: Scan quality, T-scores, WHO diagnosis, VFA
- API: `POST /forms/cs-dxa`

## 🔍 Verification Checks

### Backend Verification
```bash
# Check database for created forms
mysql -u root -p
USE rhumatoai;

# Verify all form tables exist
SHOW TABLES LIKE 'form_%';

# Check specific form data
SELECT * FROM form_cs_ric;
SELECT * FROM form_cs_os;
SELECT * FROM form_cs_echo;
SELECT * FROM form_cs_geste;
SELECT * FROM form_cs_seances;
SELECT * FROM form_cs_dxa;
```

### Frontend Verification
1. **Browser Console** (F12):
   - Check for errors
   - Verify network requests to `/api/forms/cs-*`
   - Confirm API responses with form IDs

2. **Network Tab** (F12 → Network):
   - Filter: `cs-`
   - Check POST requests successful (200/201)
   - Verify request/response payloads

3. **Elements** (F12 → Elements):
   - Verify form component renders
   - Check for collapsible sections
   - Verify input fields populated

## 🐛 Troubleshooting

### Issue: Form dropdown not appearing in Step 3
**Solution**:
- Verify care type was selected in Step 2
- Check browser console for errors
- Confirm `getFormTypes` API call succeeds
- Check database: `SELECT * FROM ref_form_types;`

### Issue: Component not rendering after form selection
**Solution**:
- Check component name matches `FORM_COMPONENT_MAP` keys
- Verify form component imported correctly
- Check for JSX syntax errors in component
- Look for error in browser console

### Issue: API submission returns 404
**Solution**:
- Verify backend server running on port 8000
- Check endpoint URL: `/api/forms/cs-[type]`
- Confirm form model imported in `backend/app/main.py`
- Check auth token in Authorization header

### Issue: Form data not saving to database
**Solution**:
- Verify database migration executed: `SHOW TABLES LIKE 'form_%'`
- Check MySQL connection works
- Review backend logs for SQL errors
- Confirm Pydantic schema validation passes

## 📊 Expected Results

### Successful Form Submission Flow
```
1. User fills form (Step 3)
2. Clicks Submit button
3. Frontend sends: POST /api/forms/cs-[type]
4. Backend validates: Pydantic schema
5. Database stores: INSERT INTO form_cs_[type]
6. Response: {"id": 42, "created_at": "2024-...", ...}
7. Frontend stores: formId = 42 in state
8. User proceeds: Step 4 (Clinical Details)
9. Final submission: Links form to medical act
```

### Database Result
```sql
mysql> SELECT id, crp_value, esr_value, das28_score, created_at FROM form_cs_ric ORDER BY id DESC LIMIT 1;
+----+-----------+-----------+------------+---------------------+
| id | crp_value | esr_value | das28_score| created_at          |
+----+-----------+-----------+------------+---------------------+
| 42 |   25.5    |    45     |    4.2     | 2024-01-15 10:30:45 |
+----+-----------+-----------+------------+---------------------+
```

## ✅ Success Criteria

- [ ] All 6 form types appear in form selection dropdown
- [ ] Form components render with proper styling
- [ ] Form fields accept input correctly
- [ ] Submit button sends data to correct API endpoint
- [ ] API returns 200 with form ID
- [ ] Form data persists in database
- [ ] Audit logs created for all operations
- [ ] Can proceed to next step after form submission

---

**Ready to test?** Start the backend and frontend servers and follow the test scenario above!
