import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (
  configService: ConfigService,
): MongooseModuleOptions => {
  const uri = configService.get<string>('MONGODB_URI');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  return {
    uri,
    autoIndex: !isProduction, // Disable auto-indexing in production for performance
    maxPoolSize: 100,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    retryWrites: true,
    retryReads: true,
    writeConcern: {
      w: 'majority',
    },
    readPreference: 'primaryPreferred',
  };
};
