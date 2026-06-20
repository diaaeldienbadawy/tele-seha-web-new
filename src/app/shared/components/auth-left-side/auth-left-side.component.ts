import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-left-side',
  imports: [],
  templateUrl: './auth-left-side.component.html',
  styleUrl: './auth-left-side.component.css'
})
export class AuthLeftSideComponent {

   @Input() logo: string = '';

}
