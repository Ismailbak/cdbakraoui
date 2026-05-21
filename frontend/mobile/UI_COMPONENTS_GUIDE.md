# Mobile UI Components Guide

## Overview

This guide covers all the new and enhanced UI components available in the mobile app. All components follow the design system defined in `src/styles/theme.js`.

---

## Installation & Setup

### 1. Add ToastProvider to App.js

```javascript
import { ToastProvider } from './src/utils/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      {/* Your navigation and screens */}
    </ToastProvider>
  );
}
```

---

## Components

### 1. **Badge**

A small, colored label for categorizing content.

```javascript
import { Badge } from './src/components/common';

<Badge 
  label="Active" 
  variant="success" 
  size="medium"
/>
```

**Props:**
- `label` (string): Badge text
- `variant` (string): 'primary', 'success', 'warning', 'error', 'actes', 'patient', 'rdv', 'appointment'
- `size` (string): 'small', 'medium', 'large'
- `style` (object): Additional styles

---

### 2. **Chip**

Interactive tag component for filtering and categorization.

```javascript
import { Chip } from './src/components/common';

<Chip 
  label="Filter"
  variant="primary"
  icon="filter"
  onPress={() => console.log('Chip pressed')}
  onDelete={() => console.log('Chip deleted')}
/>
```

**Props:**
- `label` (string): Chip text
- `variant` (string): 'default', 'primary', 'success', 'warning', 'error'
- `size` (string): 'small', 'medium', 'large'
- `icon` (string): Feather icon name
- `onPress` (function): Callback when chip is pressed
- `onDelete` (function): Callback when delete icon is pressed

---

### 3. **Card**

Enhanced card component with optional gradient, badges, and haptic feedback.

```javascript
import { Card } from './src/components/common';

<Card 
  title="Total Patients"
  value="142"
  icon="👥"
  accentColor={colors.patient}
  badge="3"
  onPress={() => navigation.navigate('Patients')}
/>
```

**Props:**
- `title` (string): Card title
- `value` (string): Large value display
- `subtitle` (string): Small subtitle
- `icon` (string): Emoji or text icon
- `accentColor` (string): Color for icon background
- `badge` (string): Badge value to display
- `isGradient` (boolean): Use gradient background
- `gradientStart` (string): Gradient start color
- `gradientEnd` (string): Gradient end color
- `onPress` (function): Card press callback
- `loading` (boolean): Show disabled state
- `disabled` (boolean): Disable card interaction
- `children` (ReactNode): Custom content

---

### 4. **Input**

Enhanced input with validation states and feedback icons.

```javascript
import { Input } from './src/components/common';

<Input 
  label="Email"
  placeholder="Enter email"
  error={emailError}
  isValid={emailIsValid}
  icon={<Feather name="mail" size={20} color={colors.primary} />}
/>
```

**Props:**
- `label` (string): Input label
- `error` (string): Error message
- `isValid` (boolean): Show success state
- `icon` (ReactNode): Leading icon
- `disabled` (boolean): Disable input
- `onIconPress` (function): Callback for error icon press
- All standard TextInput props

---

### 5. **PrimaryButton**

Enhanced button with multiple variants and haptic feedback.

```javascript
import { PrimaryButton } from './src/components/common';

<PrimaryButton 
  title="Save"
  onPress={() => handleSave()}
  loading={isLoading}
  disabled={!isFormValid}
  variant="primary"
  size="large"
  icon="✓"
/>
```

**Props:**
- `title` (string): Button text
- `onPress` (function): Button press callback
- `loading` (boolean): Show loading spinner
- `disabled` (boolean): Disable button
- `variant` (string): 'primary', 'outline', 'pill', 'danger'
- `size` (string): 'small', 'medium', 'large'
- `icon` (string): Emoji or text icon
- `iconPosition` (string): 'left', 'right'

---

### 6. **Toast**

Global notification system for user feedback.

```javascript
import { useToast } from './src/utils/ToastProvider';

const MyComponent = () => {
  const { showToast } = useToast();

  const handleAction = () => {
    showToast('Action completed!', 'success', 3000);
  };

  return <PrimaryButton title="Action" onPress={handleAction} />;
};
```

**Usage:**
```javascript
showToast(message, type, duration)
// Types: 'success', 'error', 'warning', 'info'
// Duration in milliseconds
```

---

### 7. **ErrorMessage**

Display error/warning messages with icons.

```javascript
import { ErrorMessage } from './src/components/common';

<ErrorMessage 
  message="Please fill all required fields"
  variant="error"
  icon="alert-circle"
/>
```

**Props:**
- `message` (string): Message text
- `variant` (string): 'error', 'warning', 'info'
- `icon` (string): Feather icon name
- `style` (object): Additional styles

---

### 8. **EmptyState**

Display when no data is available.

```javascript
import { EmptyState } from './src/components/common';

{patients.length === 0 ? (
  <EmptyState 
    icon="users"
    title="No Patients"
    description="Add your first patient to get started"
    actionLabel="Add Patient"
    onAction={() => navigation.navigate('AddPatient')}
  />
) : (
  // List content
)}
```

**Props:**
- `icon` (string): Feather icon name
- `title` (string): Title text
- `description` (string): Description text
- `actionLabel` (string): Action button text
- `onAction` (function): Action callback

---

### 9. **SkeletonLoader**

Loading placeholder with shimmer animation.

```javascript
import { SkeletonLoader } from './src/components/common';

{isLoading ? (
  <SkeletonLoader 
    height={80} 
    count={3}
    style={{ marginBottom: 16 }}
  />
) : (
  // Content
)}
```

**Props:**
- `width` (string): Skeleton width (default: '100%')
- `height` (number): Skeleton height in pixels
- `count` (number): Number of skeletons to show
- `style` (object): Additional styles

---

### 10. **BottomSheet**

Modal component that slides up from bottom.

```javascript
import { BottomSheet } from './src/components/common';

const [showSheet, setShowSheet] = useState(false);

<BottomSheet 
  visible={showSheet}
  onClose={() => setShowSheet(false)}
  title="Options"
  description="Choose an action"
  actions={[
    { label: 'Edit', onPress: () => handleEdit() },
    { label: 'Delete', onPress: () => handleDelete(), variant: 'danger' },
  ]}
/>
```

**Props:**
- `visible` (boolean): Show/hide bottom sheet
- `onClose` (function): Close callback
- `title` (string): Sheet title
- `description` (string): Sheet description
- `actions` (array): Array of action objects with `label`, `onPress`, `variant`
- `children` (ReactNode): Custom content
- `height` (string): Sheet height

---

### 11. **TabBar**

Navigation tabs with badge support.

```javascript
import { TabBar } from './src/components/common';

const [activeTab, setActiveTab] = useState('all');

<TabBar 
  tabs={[
    { id: 'all', label: 'All', badge: 0 },
    { id: 'pending', label: 'Pending', badge: 3 },
    { id: 'confirmed', label: 'Confirmed', badge: 0 },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  scrollable={false}
/>
```

**Props:**
- `tabs` (array): Array of tab objects with `id`, `label`, `badge`
- `activeTab` (string): Currently active tab id
- `onTabChange` (function): Callback when tab changes
- `scrollable` (boolean): Enable horizontal scroll

---

### 12. **Divider**

Visual separator between sections.

```javascript
import { Divider } from './src/components/common';

<Divider variant="horizontal" color={colors.divider} thickness={1} />
```

**Props:**
- `variant` (string): 'horizontal', 'vertical'
- `color` (string): Divider color
- `thickness` (number): Thickness in pixels
- `style` (object): Additional styles

---

### 13. **ProgressIndicator**

Step-by-step progress indicator.

```javascript
import { ProgressIndicator } from './src/components/common';

<ProgressIndicator current={2} total={5} />
```

**Props:**
- `current` (number): Current step
- `total` (number): Total steps
- `style` (object): Additional styles

---

## Utilities

### 1. **Haptic Feedback**

Trigger device vibration for better UX.

```javascript
import { hapticFeedback } from './src/utils/haptics';

// On button press
hapticFeedback.medium();

// On success
hapticFeedback.success();

// On error
hapticFeedback.error();

// On warning
hapticFeedback.warning();

// Available methods
hapticFeedback.light();
hapticFeedback.heavy();
```

---

### 2. **Gestures**

Swipe gesture utilities for interactions.

```javascript
import { useSwipeGestures, useSwipeToDelete } from './src/utils/gestures';

// Swipe left/right
const { panResponder, pan } = useSwipeGestures(
  () => console.log('Swiped left'),
  () => console.log('Swiped right')
);

// Swipe to delete
const { panResponder, pan } = useSwipeToDelete(
  () => handleDelete()
);

<View {...panResponder.panHandlers}>
  {/* Content */}
</View>
```

---

## Design System

All components use the design system from `src/styles/theme.js`:

### Colors

```javascript
colors.primary           // #3B82F6 (Blue)
colors.success          // #059669 (Green)
colors.warning          // #D97706 (Orange)
colors.error            // #DC2626 (Red)
colors.actes            // #8B5CF6 (Purple)
colors.patient          // #4F46E5 (Indigo)
colors.appointmentSuccess // #059669 (Teal)
```

### Spacing

```javascript
spacing.xs  // 4px
spacing.sm  // 8px
spacing.md  // 12px
spacing.lg  // 16px
spacing.xl  // 24px
spacing.xxl // 32px
```

### Fonts

```javascript
fonts.heading      // 36px, bold
fonts.subheading   // 20px, semibold
fonts.body         // 15px, regular
fonts.bodySmall    // 14px, regular
fonts.caption      // 13px, regular
fonts.label        // 12px, uppercase semibold
```

---

## Best Practices

1. **Always use ToastProvider** for consistent notifications
2. **Use haptic feedback** on important actions for better UX
3. **Show loading states** with SkeletonLoader or button loading prop
4. **Provide empty states** when lists are empty
5. **Use proper variant colors** for semantic meaning
6. **Test gesture interactions** on actual devices
7. **Keep consistent spacing** using spacing values
8. **Use badges for status** indicators

---

## Example: Complete Form

```javascript
import React, { useState } from 'react';
import { View } from 'react-native';
import { 
  Input, 
  PrimaryButton, 
  ErrorMessage, 
  useToast,
  ProgressIndicator 
} from './src/components/common';
import { colors, spacing } from './src/styles/theme';

export default function FormScreen() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const validateEmail = (text) => {
    setEmail(text);
    if (!text.includes('@')) {
      setEmailError('Invalid email');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async () => {
    if (emailError || !email) {
      showToast('Please fix errors', 'error');
      return;
    }
    setIsLoading(true);
    try {
      // API call
      showToast('Form submitted!', 'success');
      setCurrentStep(2);
    } catch (error) {
      showToast('Error submitting form', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: spacing.lg }}>
      <ProgressIndicator current={currentStep} total={3} />
      
      {emailError && (
        <ErrorMessage message={emailError} variant="error" />
      )}
      
      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={validateEmail}
        error={emailError}
        isValid={email && !emailError}
      />
      
      <PrimaryButton
        title="Submit"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={!!emailError || !email}
        size="large"
      />
    </View>
  );
}
```

---

## Troubleshooting

**Issue:** Toast not showing
- Make sure ToastProvider is wrapping your app
- Check that useToast is called within ToastProvider

**Issue:** Haptic feedback not working
- Requires Expo Haptics module
- Won't work on all devices (test on physical device)

**Issue:** Skeleton not animating
- Check that useNativeDriver is not blocking
- Verify Animated module is imported

---

For more help, check component implementations in `src/components/common/`
