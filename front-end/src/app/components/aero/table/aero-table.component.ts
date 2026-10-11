import { NgTemplateOutlet } from '@angular/common';
import { Component, Input, TemplateRef } from '@angular/core';

export interface AeroTableColumn { key: string; label: string; }
export type AeroTableRow = Record<string, unknown>;
export interface AeroTableCell { $implicit: unknown; row: AeroTableRow; column: AeroTableColumn; }

@Component({
  selector: 'app-aero-table', standalone: true, imports: [NgTemplateOutlet],
  template: `<div class="aero-table-wrap" tabindex="0" role="region" [attr.aria-label]="caption">
    <table class="aero-table"><caption>{{ caption }}</caption><thead><tr>
      @for (column of columns; track column.key) { <th scope="col">{{ column.label }}</th> }
    </tr></thead><tbody>
      @for (row of rows; track $index) {
        <tr>@for (column of columns; track column.key) {
          <td>@if (cellTemplate) { <ng-container [ngTemplateOutlet]="cellTemplate" [ngTemplateOutletContext]="{ $implicit: row[column.key], row: row, column: column }" /> }
          @else { {{ row[column.key] ?? '—' }} }</td>
        }</tr>
      } @empty { <tr><td [attr.colspan]="columns.length || 1">{{ emptyMessage }}</td></tr> }
    </tbody></table>
  </div>`,
  styles: [':host { display: block; min-width: 0; }'],
})
export class AeroTableComponent {
  @Input() caption = 'Registros';
  @Input() columns: AeroTableColumn[] = [];
  @Input() rows: AeroTableRow[] = [];
  @Input() emptyMessage = 'Nenhum registro encontrado.';
  @Input() cellTemplate: TemplateRef<AeroTableCell> | null = null;
}
