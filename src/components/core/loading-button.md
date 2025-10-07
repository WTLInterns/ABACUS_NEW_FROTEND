# LoadingButton Component

A reusable button component that shows a loading indicator when an operation is in progress.

## Usage

```jsx
import { LoadingButton } from '@/components/core/loading-button';

// Basic usage
<LoadingButton loading={isLoading} onClick={handleClick}>
  Click me
</LoadingButton>

// With custom loading text
<LoadingButton loading={isLoading} loadingText="Saving..." variant="contained">
  Save Changes
</LoadingButton>

// All MUI Button props are supported
<LoadingButton 
  loading={isLoading} 
  variant="outlined" 
  color="secondary"
  disabled={someCondition}
  type="submit"
>
  Submit
</LoadingButton>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| loading | boolean | false | Whether to show the loading indicator |
| loadingText | string | children | Text to display while loading |
| ...ButtonProps | - | - | All MUI Button props are supported |

## Features

- Shows a circular progress indicator when [loading](file://d:\WTL_Abhishek\Nextjs\Abacus_New_FrontEnd1\src\components\core\loading-button.tsx#L10-L10) is true
- Displays [loadingText](file://d:\WTL_Abhishek\Nextjs\Abacus_New_FrontEnd1\src\components\core\loading-button.tsx#L11-L11) or the button's children when loading
- Automatically disables the button when loading
- Maintains all MUI Button functionality and styling options