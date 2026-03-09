import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({}),
  }),
}));

import * as nodemailer from 'nodemailer';

describe('EmailService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when SMTP is NOT configured', () => {
    let service: EmailService;
    let mockConfigService: Partial<ConfigService>;

    beforeEach(async () => {
      mockConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
      service.onModuleInit();
    });

    it('does NOT call nodemailer.createTransport', () => {
      expect(nodemailer.createTransport).not.toHaveBeenCalled();
    });

    it('sendPasswordResetOtp resolves without error', async () => {
      await expect(
        service.sendPasswordResetOtp('user@example.com', '123456'),
      ).resolves.toBeUndefined();
    });

    it('sendWelcomeEmail resolves without error', async () => {
      await expect(
        service.sendWelcomeEmail('user@example.com', 'John', 'Employer'),
      ).resolves.toBeUndefined();
    });

    it('sendUserDeactivationEmail resolves without error', async () => {
      await expect(
        service.sendUserDeactivationEmail('user@example.com', 'John'),
      ).resolves.toBeUndefined();
    });

    it('sendOrderApprovedEmail resolves without error for Standard order', async () => {
      await expect(
        service.sendOrderApprovedEmail('user@example.com', {
          orderId: 'order-1',
          orderType: 'Standard',
          itemCount: 3,
        }),
      ).resolves.toBeUndefined();
    });

    it('sendOrderApprovedEmail resolves without error for Devolution order', async () => {
      await expect(
        service.sendOrderApprovedEmail('user@example.com', {
          orderId: 'order-2',
          orderType: 'Devolution',
          itemCount: 1,
          companyName: 'ACME Corp',
        }),
      ).resolves.toBeUndefined();
    });

    it('sendOrderRejectedEmail resolves without error and handles rejectionReason', async () => {
      await expect(
        service.sendOrderRejectedEmail('user@example.com', {
          orderId: 'order-3',
          orderType: 'Standard',
          itemCount: 2,
          rejectionReason: 'Items not in stock',
        }),
      ).resolves.toBeUndefined();
    });

    it('sendOrderRejectedEmail resolves when no rejectionReason provided', async () => {
      await expect(
        service.sendOrderRejectedEmail('user@example.com', {
          orderId: 'order-4',
          orderType: 'Devolution',
          itemCount: 1,
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('when SMTP IS configured', () => {
    let service: EmailService;
    let mockConfigService: Partial<ConfigService>;
    let mockSendMail: jest.Mock;

    beforeEach(async () => {
      mockSendMail = jest.fn().mockResolvedValue({});
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        sendMail: mockSendMail,
      });

      mockConfigService = {
        get: jest.fn().mockImplementation((key: string) => {
          const config: Record<string, string | number> = {
            SMTP_HOST: 'smtp.example.com',
            SMTP_PORT: 587,
            SMTP_USER: 'user@example.com',
            SMTP_PASS: 'secret',
            SMTP_FROM: 'noreply@trackit.com',
          };
          return config[key];
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
      service.onModuleInit();
    });

    it('calls nodemailer.createTransport on init', () => {
      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.example.com',
        }),
      );
    });

    it('sendPasswordResetOtp sends via transporter', async () => {
      await service.sendPasswordResetOtp('user@example.com', '654321');
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Password Reset'),
        }),
      );
    });

    it('sendWelcomeEmail sends via transporter', async () => {
      await service.sendWelcomeEmail('user@example.com', 'Alice', 'CompanyAdmin');
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Welcome'),
        }),
      );
    });

    it('sendUserDeactivationEmail sends via transporter', async () => {
      await service.sendUserDeactivationEmail('user@example.com', 'Bob');
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Deactivated'),
        }),
      );
    });

    it('sendOrderApprovedEmail sends via transporter for Standard orders', async () => {
      await service.sendOrderApprovedEmail('user@example.com', {
        orderId: 'o1',
        orderType: 'Standard',
        itemCount: 5,
      });
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Approved'),
        }),
      );
    });

    it('sendOrderApprovedEmail sends via transporter for Devolution orders', async () => {
      await service.sendOrderApprovedEmail('user@example.com', {
        orderId: 'o2',
        orderType: 'Devolution',
        itemCount: 2,
      });
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Devolution'),
        }),
      );
    });

    it('sendOrderRejectedEmail sends via transporter with rejection reason', async () => {
      await service.sendOrderRejectedEmail('user@example.com', {
        orderId: 'o3',
        orderType: 'Standard',
        itemCount: 1,
        rejectionReason: 'Out of stock',
      });
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Rejected'),
          html: expect.stringContaining('Out of stock'),
        }),
      );
    });

    it('does not throw when sendMail fails', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));
      await expect(
        service.sendWelcomeEmail('user@example.com', 'Err', 'Employer'),
      ).resolves.toBeUndefined();
    });
  });
});
