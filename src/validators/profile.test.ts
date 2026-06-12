import { describe, it, expect } from 'vitest';
import { updateProfileSchema } from './profile';

describe('updateProfileSchema Contract Tests', () => {
    it('should validate a correct profile update payload', () => {
        const payload = {
            nome: 'Corretor João',
            telefone: '11999998888',
            creci: '12345',
            imobiliaria: 'Imóveis do João'
        };

        const result = updateProfileSchema.safeParse(payload);
        expect(result.success).toBe(true);
    });

    it('should reject extra fields due to .strict()', () => {
        const payload = {
            nome: 'Corretor João',
            campoInexistente: 'Vulnerabilidade'
        };

        const result = updateProfileSchema.safeParse(payload);
        
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toContain('Campos adicionais não são permitidos');
        }
    });

    it('should reject specifically critical fields like is_ceo', () => {
        const payload = {
            nome: 'Hacker',
            is_ceo: true
        };

        const result = updateProfileSchema.safeParse(payload);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toContain('Campos adicionais não são permitidos');
        }
    });

    it('should validate empty object since fields are optional', () => {
        const result = updateProfileSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('should reject invalid URLs for avatar_url', () => {
        const payload = {
            avatar_url: 'not-a-url'
        };

        const result = updateProfileSchema.safeParse(payload);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toBe('URL de avatar inválida');
        }
    });
});
