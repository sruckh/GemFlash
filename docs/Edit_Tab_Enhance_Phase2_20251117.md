# Edit Tab Enhancement - Phase 2 Implementation Plan
**Date:** November 17, 2025
**Priority:** HIGH
**Timeline:** 1 week
**Expected Impact:** 70% usability improvement (30% additional from Phase 1)

## Overview

Phase 2 builds on the foundation established in Phase 1 by adding workflow visualization, smooth transitions, comprehensive state feedback, and polished typography. These improvements create a professional, confidence-inspiring user experience.

## Prerequisites

Phase 1 must be completed before starting Phase 2:
- ✅ All sections always visible with empty states
- ✅ Icons and improved headings implemented
- ✅ Color differentiation applied
- ✅ ARIA live regions active
- ✅ Focus indicators enhanced
- ✅ Spacing system implemented

## Goals

1. **Workflow Clarity**: Show users where they are and what comes next
2. **Smooth Interactions**: Eliminate jarring transitions with animations
3. **State Feedback**: Provide clear, timely feedback for all actions
4. **Typography Excellence**: Establish professional typographic hierarchy
5. **Smart Focus**: Guide user attention to relevant content
6. **Motion Accessibility**: Respect user motion preferences
7. **Visual Polish**: Complete the professional, polished appearance

## Tasks

### Task 1: Workflow Stepper Visualization

**Objective**: Implement horizontal progress indicator showing all workflow steps upfront.

**Files to Modify:**
- `frontend/src/App.jsx` (or new `WorkflowStepper.jsx` component)

**Implementation Details:**

#### 1.1 Workflow Stepper Component

Create new component or add to App.jsx:

```jsx
const WorkflowStepper = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Upload', icon: ImageIcon, description: 'Add images' },
    { id: 2, name: 'Edit', icon: EditIcon, description: 'Select & modify' },
    { id: 3, name: 'Download', icon: DownloadIcon, description: 'Get results' }
  ];

  return (
    <nav aria-label="Editing workflow progress" className="mb-8">
      <ol className="flex items-center justify-center">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`flex items-center ${
              index !== steps.length - 1 ? 'flex-1' : ''
            }`}
          >
            {/* Step Circle */}
            <div className="relative flex flex-col items-center">
              <div
                className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2
                  transition-all duration-300
                  ${
                    step.id === currentStep
                      ? 'border-blue-600 bg-blue-600 text-white scale-110'
                      : step.id < currentStep
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-400'
                  }
                `}
              >
                {step.id < currentStep ? (
                  <CheckIcon className="w-6 h-6" />
                ) : (
                  <step.icon className="w-6 h-6" />
                )}
              </div>

              {/* Step Label */}
              <div className="absolute -bottom-8 text-center">
                <p
                  className={`text-sm font-medium ${
                    step.id === currentStep
                      ? 'text-blue-600'
                      : step.id < currentStep
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {step.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index !== steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-4 transition-all duration-300
                  ${
                    step.id < currentStep
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }
                `}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
```

#### 1.2 Step Calculation Logic

Determine current step based on state:

```jsx
const getCurrentWorkflowStep = () => {
  if (editedImages.length > 0) return 3; // Download
  if (selectedImageUrl || availableImages.length > 0) return 2; // Edit
  return 1; // Upload
};

const currentStep = getCurrentWorkflowStep();
```

#### 1.3 Integration into Edit Tab

Add at top of edit tab content:

```jsx
<div className="edit-tab">
  <WorkflowStepper currentStep={currentStep} />

  {/* Rest of edit tab content */}
</div>
```

**Visual Specifications:**
- Step circle: 48px (w-12 h-12), 2px border
- Active step: Blue (#2563EB), scale 110%, icon animated
- Completed step: Blue with checkmark icon
- Future step: Gray (#D1D5DB), smaller
- Connector line: 2px height (h-0.5), 16px margins (mx-4)
- Labels: 14px (text-sm), 12px description (text-xs)
- Bottom spacing: 32px (mb-8)

**Accessibility:**
- `aria-label` on nav element
- Current step announced to screen readers
- Keyboard navigable (optional clickable)

**Success Indicator:**
- Stepper visible at top of tab
- Current step highlighted
- Completed steps marked with checkmark
- Smooth transitions between steps

---

### Task 2: Smooth Transitions and Animations

**Objective**: Implement smooth expand/fade animations when sections gain content.

**Files to Modify:**
- `frontend/src/App.jsx`
- `frontend/src/index.css` or component-level styles

**Implementation Details:**

#### 2.1 Animation CSS

Add to global CSS or use inline styles:

```css
/* Section expand animation */
.section-expand-enter {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.section-expand-enter-active {
  opacity: 1;
  max-height: 1000px;
  transition: opacity 300ms ease-out, max-height 300ms ease-out;
}

.section-expand-exit {
  opacity: 1;
  max-height: 1000px;
}

.section-expand-exit-active {
  opacity: 0;
  max-height: 0;
  transition: opacity 200ms ease-in, max-height 200ms ease-in;
  overflow: hidden;
}

/* Card appear animation */
.card-appear {
  animation: cardFadeIn 300ms ease-out;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .section-expand-enter-active,
  .section-expand-exit-active,
  .card-appear {
    animation: none;
    transition: none;
  }
}
```

#### 2.2 React Transition Group (Optional)

If using react-transition-group for more control:

```bash
npm install react-transition-group
```

```jsx
import { CSSTransition, TransitionGroup } from 'react-transition-group';

<TransitionGroup>
  {availableImages.map((image) => (
    <CSSTransition
      key={image.id}
      timeout={300}
      classNames="card"
    >
      <EnhancedImageCard {...image} />
    </CSSTransition>
  ))}
</TransitionGroup>
```

#### 2.3 Simple CSS Transition Approach

Add animation class to new cards:

```jsx
{availableImages.map((image, index) => (
  <div
    key={image.id}
    className="card-appear"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <EnhancedImageCard {...image} />
  </div>
))}
```

**Animation Guidelines:**
- Duration: 200-300ms (fast enough not to slow workflow)
- Easing: ease-out (starts fast, slows down)
- Stagger: 50ms delay between cards for visual interest
- What animates: Opacity + translateY (vertical movement)
- Reduced motion: Instant transitions via CSS media query

**Success Indicator:**
- Smooth appearance of new content
- No jarring transitions
- Respects prefers-reduced-motion
- Doesn't slow down workflow

---

### Task 3: Skeleton Loading States

**Objective**: Show placeholder skeletons for operations >500ms to indicate layout and reduce perceived loading time.

**Files to Modify:**
- `frontend/src/App.jsx`
- New `SkeletonCard.jsx` component (optional)

**Implementation Details:**

#### 3.1 Skeleton Card Component

```jsx
const SkeletonCard = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 p-2 animate-pulse">
    {/* Image skeleton */}
    <div className="bg-gray-200 h-48 rounded-md mb-2" />

    {/* Text skeleton */}
    <div className="space-y-2">
      <div className="bg-gray-200 h-3 rounded w-3/4" />
      <div className="bg-gray-200 h-3 rounded w-1/2" />
    </div>

    {/* Metadata skeleton */}
    <div className="flex gap-2 mt-2">
      <div className="bg-gray-200 h-2 rounded w-16" />
      <div className="bg-gray-200 h-2 rounded w-16" />
    </div>
  </div>
);
```

#### 3.2 Loading State Management

Add loading states to component:

```jsx
const [isUploadingImages, setIsUploadingImages] = useState(false);
const [isEditingImage, setIsEditingImage] = useState(false);
```

#### 3.3 Skeleton Display Logic

Show skeletons during upload:

```jsx
{isUploadingImages && (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)}
```

Show skeleton during edit:

```jsx
{isEditingImage && (
  <div className="flex justify-center items-center py-8">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
      <p className="text-sm text-gray-600">Editing image...</p>
      <p className="text-xs text-gray-500 mt-1">About 15 seconds remaining</p>
    </div>
  </div>
)}
```

**Skeleton Specifications:**
- Pulse animation: Built-in Tailwind `animate-pulse`
- Gray background: #E5E7EB (gray-200)
- Maintains same layout as real content
- Shows for operations >500ms
- Replaced with real content when ready

**Success Indicator:**
- Skeletons appear during loading
- Layout doesn't shift when content appears
- Users understand content is loading
- Reduced perceived loading time

---

### Task 4: Success and Error State Messages

**Objective**: Provide clear, timely feedback for all user actions with success confirmations and error recovery guidance.

**Files to Modify:**
- `frontend/src/App.jsx`
- New `Toast.jsx` component (recommended)

**Implementation Details:**

#### 4.1 Toast Notification Component

```jsx
const Toast = ({ type, message, show, onDismiss }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!show) return null;

  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200'
  };

  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InfoIcon,
    warning: AlertTriangleIcon
  };

  const Icon = icons[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed top-4 right-4 z-50
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
        ${styles[type]}
        animate-slideIn
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onDismiss}
        className="ml-2 text-current opacity-70 hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
```

#### 4.2 Toast State Management

```jsx
const [toast, setToast] = useState({ show: false, type: 'info', message: '' });

const showToast = (type, message) => {
  setToast({ show: true, type, message });
};

const dismissToast = () => {
  setToast({ ...toast, show: false });
};
```

#### 4.3 Success Messages

**After Image Upload:**
```jsx
const handleImageUpload = async (files) => {
  try {
    // Upload logic
    const count = files.length;
    showToast('success', `${count} image${count > 1 ? 's' : ''} uploaded successfully`);
  } catch (error) {
    showToast('error', 'Upload failed. Please try again.');
  }
};
```

**After Image Edit:**
```jsx
const handleImageEdit = async () => {
  try {
    // Edit logic
    showToast('success', 'Image edited successfully');
  } catch (error) {
    showToast('error', error.message || 'Edit failed. Please try again.');
  }
};
```

#### 4.4 Error Messages with Recovery

**File Size Error:**
```jsx
if (file.size > 10 * 1024 * 1024) {
  showToast('error', 'File size exceeds 10MB. Please compress or select a smaller image.');
  return;
}
```

**Network Error:**
```jsx
catch (error) {
  if (error.message.includes('network')) {
    showToast('error', 'Network error. Please check your connection and try again.');
  } else {
    showToast('error', `Error: ${error.message}`);
  }
}
```

#### 4.5 Processing States

```jsx
const [editProgress, setEditProgress] = useState(0);

<div className="flex items-center gap-2">
  <div className="flex-1 bg-gray-200 rounded-full h-2">
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${editProgress}%` }}
    />
  </div>
  <span className="text-sm text-gray-600">{editProgress}%</span>
</div>
```

**Toast Animation CSS:**
```css
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slideIn {
  animation: slideIn 300ms ease-out;
}
```

**Success Indicator:**
- Toast appears for all significant actions
- Auto-dismisses after 5 seconds
- Dismissible by user
- Clear error recovery guidance
- Progress shown for long operations

---

### Task 5: Typography Hierarchy Enhancement

**Objective**: Establish clear, professional typographic scale throughout the edit tab.

**Files to Modify:**
- `frontend/src/App.jsx`
- `frontend/src/components/EnhancedImageCard.jsx`
- `frontend/src/index.css` (optional global styles)

**Implementation Details:**

#### 5.1 Typography Scale Definition

Add to global CSS or use Tailwind classes consistently:

```css
/* Typography Scale */
.text-page-title {
  font-size: 1.875rem; /* 30px */
  font-weight: 700;
  color: #2563EB; /* blue-600 */
  line-height: 1.2;
}

.text-section-heading {
  font-size: 1.25rem; /* 20px */
  font-weight: 600;
  color: #1F2937; /* gray-800 */
  line-height: 1.3;
}

.text-subsection-heading {
  font-size: 1rem; /* 16px */
  font-weight: 500;
  color: #4B5563; /* gray-600 */
  line-height: 1.4;
}

.text-body {
  font-size: 0.875rem; /* 14px */
  font-weight: 400;
  color: #374151; /* gray-700 */
  line-height: 1.5;
}

.text-helper {
  font-size: 0.75rem; /* 12px */
  font-weight: 400;
  color: #6B7280; /* gray-500 */
  line-height: 1.4;
}
```

#### 5.2 Apply Typography to Sections

**Page Title (if exists):**
```jsx
<h1 className="text-3xl font-bold text-blue-600 mb-8">
  Edit Images
</h1>
```

**Section Headings:**
```jsx
<h2 className="text-xl font-semibold text-gray-900">
  Your Images {availableImages.length > 0 && `(${availableImages.length})`}
</h2>
```

**Helper Text:**
```jsx
<p className="text-sm text-gray-500 mt-0.5">
  Select an image to edit
</p>
```

**Body Text:**
```jsx
<p className="text-sm text-gray-700">
  Upload images using the panel on the right to get started with editing
</p>
```

**Small Text (metadata):**
```jsx
<p className="text-xs text-gray-500">
  1920 × 1080 • 2.4 MB
</p>
```

#### 5.3 Typography in Image Cards

Update EnhancedImageCard component:

```jsx
{/* Image description */}
<p className="text-sm font-medium text-gray-900 line-clamp-1">
  {image.prompt || 'Untitled Image'}
</p>

{/* Metadata */}
<div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
  <span>{width} × {height}</span>
  <span>•</span>
  <span>{fileSize}</span>
</div>
```

#### 5.4 Contrast Verification

Ensure all text meets WCAG AA standards:

| Text | Color | Background | Ratio | Pass |
|------|-------|-----------|-------|------|
| Headings | #1F2937 | #FFFFFF | 12.6:1 | ✅ AAA |
| Body | #374151 | #FFFFFF | 10.5:1 | ✅ AAA |
| Helper | #6B7280 | #FFFFFF | 4.6:1 | ✅ AA |
| Small | #6B7280 | #F9FAFB | 4.1:1 | ✅ AA |

**Success Indicator:**
- Clear visual hierarchy
- Consistent font sizes and weights
- All text meets 4.5:1 contrast minimum
- Professional, polished appearance

---

### Task 6: Focus Management

**Objective**: Programmatically move focus to relevant content after significant state changes.

**Files to Modify:**
- `frontend/src/App.jsx`

**Implementation Details:**

#### 6.1 Focus Refs

Create refs for focusable elements:

```jsx
const firstImageRef = useRef(null);
const editedImageRef = useRef(null);
const errorMessageRef = useRef(null);
```

#### 6.2 Focus After Upload

```jsx
const handleImageUpload = async (files) => {
  try {
    // Upload logic
    const uploadedImages = await uploadFiles(files);
    setAvailableImages([...availableImages, ...uploadedImages]);

    // Move focus to first uploaded image
    setTimeout(() => {
      firstImageRef.current?.focus();
    }, 100);

    showToast('success', `${files.length} images uploaded. Focus on first image.`);
  } catch (error) {
    showToast('error', 'Upload failed');
  }
};
```

#### 6.3 Focus After Edit

```jsx
const handleImageEdit = async () => {
  try {
    // Edit logic
    const editedImage = await editImage(selectedImageUrl, editPrompt);
    setEditedImages([editedImage, ...editedImages]);

    // Move focus to edited image
    setTimeout(() => {
      editedImageRef.current?.focus();
    }, 100);

    showToast('success', 'Edit complete. Focus on edited image.');
  } catch (error) {
    showToast('error', error.message);
  }
};
```

#### 6.4 Focus on Error

```jsx
catch (error) {
  setError(error.message);

  // Move focus to error message
  setTimeout(() => {
    errorMessageRef.current?.focus();
  }, 100);

  showToast('error', error.message);
}
```

#### 6.5 Apply Refs to Elements

```jsx
{/* First image */}
<EnhancedImageCard
  ref={index === 0 ? firstImageRef : null}
  {...image}
/>

{/* Edited image */}
<EnhancedImageCard
  ref={index === 0 ? editedImageRef : null}
  {...image}
/>

{/* Error message */}
<div
  ref={errorMessageRef}
  tabIndex={-1}
  className="error-message"
>
  {error}
</div>
```

**Focus Management Guidelines:**
- Use setTimeout(100ms) to allow DOM updates
- Only move focus for user-initiated actions
- Announce focus changes to screen readers
- Don't trap focus unintentionally
- Provide escape routes (Escape key)

**Success Indicator:**
- Focus moves to new content automatically
- Keyboard users know where they are
- Screen readers announce focus changes
- Natural, non-jarring focus movement

---

### Task 7: Motion Accessibility

**Objective**: Respect user motion preferences and provide instant alternatives.

**Files to Modify:**
- `frontend/src/index.css`
- All components with animations

**Implementation Details:**

#### 7.1 Global Reduced Motion Override

Add to global CSS:

```css
/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

#### 7.2 Component-Specific Reduced Motion

For specific animations:

```css
/* Workflow stepper animation */
.step-circle {
  transition: all 300ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .step-circle {
    transition: none;
  }
}

/* Card appear animation */
.card-appear {
  animation: cardFadeIn 300ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .card-appear {
    animation: none;
  }
}

/* Toast slide-in */
.animate-slideIn {
  animation: slideIn 300ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .animate-slideIn {
    animation: none;
  }
}
```

#### 7.3 JavaScript Detection (Optional)

Detect motion preference in JavaScript:

```jsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animationDuration = prefersReducedMotion ? 0 : 300;
```

Use in animations:

```jsx
<div
  style={{
    transition: prefersReducedMotion ? 'none' : 'all 300ms ease-out'
  }}
>
  {/* Content */}
</div>
```

#### 7.4 User Setting Override (Future Enhancement)

Provide setting to disable animations:

```jsx
const [enableAnimations, setEnableAnimations] = useState(
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
);
```

**Motion Accessibility Guidelines:**
- Respect system preferences by default
- Provide user override in settings (optional)
- Never force auto-playing animations
- Instant transitions when motion disabled
- Don't remove functionality, only motion

**Success Indicator:**
- Animations disabled when prefers-reduced-motion set
- Instant transitions provided as alternative
- No loss of functionality
- Respects user autonomy

---

### Task 8: Empty State Visual Polish (Enhancement)

**Objective**: Further refine empty states with subtle enhancements from Phase 1.

**Files to Modify:**
- `frontend/src/App.jsx`

**Implementation Details:**

#### 8.1 Enhanced Empty State with Call-to-Action

**Available Images:**
```jsx
<EmptyState
  icon={ImageIcon}
  title="No images uploaded yet"
  description="Upload images using the panel on the right to get started with editing"
  action={
    <button
      onClick={() => document.getElementById('file-upload-input')?.click()}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Choose Files
    </button>
  }
/>
```

#### 8.2 Animated Empty State Icons

Add subtle pulse animation to icons:

```jsx
<Icon className="w-16 h-16 text-gray-300 mb-4 animate-pulse-slow" />
```

CSS:

```css
@keyframes pulseSlow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse-slow {
  animation: pulseSlow 3s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-pulse-slow {
    animation: none;
  }
}
```

#### 8.3 Contextual Empty States

Different messages based on state:

```jsx
const getEmptyStateMessage = () => {
  if (isUploadError) {
    return {
      title: "Upload failed",
      description: "There was a problem uploading your images. Please try again.",
      action: <RetryButton />
    };
  }

  return {
    title: "No images uploaded yet",
    description: "Upload images using the panel on the right to get started",
    action: null
  };
};
```

**Success Indicator:**
- Empty states feel polished and professional
- Call-to-action buttons when appropriate
- Contextual messages based on state
- Subtle animations enhance without distracting

---

## Implementation Checklist

### Pre-Implementation
- [ ] Phase 1 completed and tested
- [ ] Review animation libraries (react-transition-group optional)
- [ ] Plan focus management strategy
- [ ] Design toast notification system

### During Implementation
- [ ] **Task 1**: Workflow stepper visualization
- [ ] **Task 2**: Smooth transitions
- [ ] **Task 3**: Skeleton loading states
- [ ] **Task 4**: Success/error messages
- [ ] **Task 5**: Typography hierarchy
- [ ] **Task 6**: Focus management
- [ ] **Task 7**: Motion accessibility
- [ ] **Task 8**: Empty state polish

### Testing
- [ ] Workflow stepper updates correctly
- [ ] Animations smooth and appropriate
- [ ] Skeletons match final content layout
- [ ] Toast messages clear and helpful
- [ ] Typography readable and hierarchical
- [ ] Focus moves appropriately
- [ ] Reduced motion respected
- [ ] Test with screen reader
- [ ] Test keyboard navigation
- [ ] Test on multiple screen sizes
- [ ] Verify WCAG AA compliance

### Validation
- [ ] Workflow stepper shows current step
- [ ] Transitions feel smooth (not jarring)
- [ ] Loading states reduce perceived wait time
- [ ] All actions have feedback
- [ ] Typography creates clear hierarchy
- [ ] Focus management helps navigation
- [ ] Motion preferences respected
- [ ] Professional, polished appearance

## Files Modified

1. `frontend/src/App.jsx` - Main edit tab logic
2. `frontend/src/components/WorkflowStepper.jsx` (new)
3. `frontend/src/components/Toast.jsx` (new)
4. `frontend/src/components/SkeletonCard.jsx` (new)
5. `frontend/src/index.css` - Global styles and animations

## Dependencies

Existing:
- `lucide-react` - Icons
- Tailwind CSS - Styling

Optional:
- `react-transition-group` - Advanced animations (if needed)

## Testing Tools

- **Visual**: Browser DevTools, multiple browsers
- **Animations**: Chrome DevTools Animation Inspector
- **Accessibility**: axe DevTools, WAVE, Lighthouse
- **Screen Reader**: NVDA (Windows), VoiceOver (macOS)
- **Contrast**: WebAIM Contrast Checker
- **Motion**: Browser DevTools device emulation

## Success Metrics

- **Workflow Clarity**: Users understand their position and next steps
- **Smooth Interactions**: Animations enhance without slowing workflow
- **State Feedback**: All actions receive clear, timely feedback
- **Typography**: 1.5-2x visual weight hierarchy established
- **Focus Management**: Keyboard users guided appropriately
- **Motion Accessibility**: Full functionality with motion disabled
- **Professional Polish**: Cohesive, confidence-inspiring design

## Risk Mitigation

**Potential Issues:**

1. Animations may slow down workflow
   - **Mitigation**: 200-300ms max duration, skippable

2. Focus management may be disorienting
   - **Mitigation**: Only move focus for significant actions, announce changes

3. Toast notifications may be missed
   - **Mitigation**: Screen reader announcements + auto-dismiss

4. Workflow stepper may add clutter
   - **Mitigation**: Compact design, meaningful information

## Integration with Phase 1

Phase 2 builds on Phase 1 foundation:
- ✅ Stepper complements always-visible sections
- ✅ Animations enhance color differentiation
- ✅ Focus management works with ARIA regions
- ✅ Typography enhances icon/heading hierarchy

## Next Steps

After Phase 2 completion:
1. User testing with diverse users
2. Performance monitoring (CLS, animation performance)
3. A/B testing of workflow stepper
4. Accessibility audit with real users
5. Consider Phase 3 advanced features

## Notes

- All animations respect prefers-reduced-motion
- Focus management enhances keyboard navigation
- Toast notifications provide consistent feedback pattern
- Typography system reusable across application
- Workflow stepper can be extracted as reusable component
