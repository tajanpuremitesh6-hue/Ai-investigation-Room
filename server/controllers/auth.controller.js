import { getCurrentUser, loginUser, registerUser } from '../services/auth.service.js';

export async function register(request, response) {
  const data = await registerUser(request.validatedBody);
  response.status(201).json({ success: true, message: 'Account created.', data });
}

export async function login(request, response) {
  const data = await loginUser(request.validatedBody);
  response.json({ success: true, message: 'Signed in.', data });
}

export async function me(request, response) {
  const user = await getCurrentUser(request.auth.userId);
  response.json({ success: true, message: 'Current user loaded.', data: { user } });
}
