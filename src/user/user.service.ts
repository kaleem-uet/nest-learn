import { Injectable } from '@nestjs/common';
import { HelloService } from 'src/hello/hello.service';

@Injectable()
export class UserService {
  constructor(private readonly helloService: HelloService) {}

  getUsers(): { id: number; name: string; greeting: string }[] {
    // This is a placeholder for user data retrieval logic
    return [
      {
        id: 1,
        name: 'John Doe',
        greeting: this.helloService.getGreeting('John Doe'),
      },
      {
        id: 2,
        name: 'Jane Doe 2',
        greeting: this.helloService.getGreeting('Jane Doe 2'),
      },
      {
        id: 3,
        name: 'Alice Smith',
        greeting: this.helloService.getGreeting('Alice Smith'),
      },
      {
        id: 4,
        name: 'Bob Johnson',
        greeting: this.helloService.getGreeting('Bob Johnson'),
      },
      {
        id: 5,
        name: 'Charlie Brown',
        greeting: this.helloService.getGreeting('Charlie Brown'),
      },
      {
        id: 6,
        name: 'David Wilson',
        greeting: this.helloService.getGreeting('David Wilson'),
      },
    ];
  }

  getUserById(
    id: number,
  ): { id: number; name: string; greeting: string } | null {
    const users = this.getUsers();
    return users.find((user) => user.id === id) || null;
  }

  getWelcomeMessage(id: number) {
    const user = this.getUserById(id);
    if (!user) {
      return 'User not found';
    }
    return this.helloService.getGreeting(user.name);
  }
}
