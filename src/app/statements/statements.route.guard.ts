import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Injectable()
export class CanActivateService implements CanActivate {
  user$ = this.userService.dbUser$;

  constructor(private userService: UserService) {}

  canActivate(): Observable<boolean> | Promise<boolean> {
    return this.userService.dbUser$.pipe(map((user) => user.lob_statements));
  }
}
