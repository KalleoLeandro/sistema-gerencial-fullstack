import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusAtendimento',
  standalone: true
})
export class StatusPipe implements PipeTransform {

   transform(value: number): string {
    const map: Record<number, string> = {
      1: 'AGUARDANDO ATENDIMENTO',
      2: 'EM ATENDIMENTO',
      3: 'FINALIZADO',
      4: 'CANCELADO'
    };

    return map[value] || 'DESCONHECIDO';
  }
}
