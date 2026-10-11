import { AeroButtonComponent } from './button/aero-button.component';
import { AeroThemeToggleComponent } from './theme-toggle/aero-theme-toggle.component';
export { AeroThemeToggleComponent };
export { AeroFieldComponent, AeroNativeControlComponent, AeroNativeButtonComponent } from './forms/aero-native.component';
export { AeroDateDirective } from './forms/aero-date.directive';
import { AeroInputComponent } from './input/aero-input.component';
import { AeroSelectComponent } from './select/aero-select.component';
import { AeroTextareaComponent } from './textarea/aero-textarea.component';
import { AeroCheckboxComponent } from './checkbox/aero-checkbox.component';
import { AeroRadioGroupComponent } from './radio-group/aero-radio-group.component';
import { AeroFileComponent } from './file/aero-file.component';
import { AeroCardComponent } from './card/aero-card.component';
import { AeroBadgeComponent } from './badge/aero-badge.component';
import { AeroAlertComponent } from './alert/aero-alert.component';
import { AeroProgressComponent } from './progress/aero-progress.component';
import { AeroDetailsComponent } from './details/aero-details.component';
import { AeroDialogComponent } from './dialog/aero-dialog.component';
import { AeroPaginationComponent } from './pagination/aero-pagination.component';
import { AeroSegmentedComponent } from './segmented/aero-segmented.component';
import { AeroTableComponent } from './table/aero-table.component';

export { AeroButtonComponent, AeroInputComponent, AeroSelectComponent, AeroTextareaComponent,
  AeroCheckboxComponent, AeroRadioGroupComponent, AeroFileComponent, AeroCardComponent,
  AeroBadgeComponent, AeroAlertComponent, AeroProgressComponent, AeroDetailsComponent,
  AeroDialogComponent, AeroPaginationComponent, AeroSegmentedComponent, AeroTableComponent };
export type { AeroButtonVariant } from './button/aero-button.component';
export type { AeroOption } from './select/aero-select.component';
export type { AeroTableColumn, AeroTableRow, AeroTableCell } from './table/aero-table.component';

/** Convenient for the catalogue. Feature pages should import only the components they use. */
export const AERO_COMPONENTS = [AeroButtonComponent, AeroInputComponent, AeroSelectComponent,
  AeroTextareaComponent, AeroCheckboxComponent, AeroRadioGroupComponent, AeroFileComponent,
  AeroCardComponent, AeroBadgeComponent, AeroAlertComponent, AeroProgressComponent,
  AeroDetailsComponent, AeroDialogComponent, AeroPaginationComponent, AeroSegmentedComponent,
  AeroTableComponent, AeroThemeToggleComponent] as const;
