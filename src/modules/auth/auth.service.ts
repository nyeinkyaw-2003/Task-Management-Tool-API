import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    constructor (private readonly userService: UserService) {}
}
