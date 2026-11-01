import mongoose from 'mongoose';

export function getHealth(_request, response) {
  const database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  response.json({
    success: true,
    message: 'AI Mystery Room API is running.',
    data: { status: 'ok', database },
  });
}
