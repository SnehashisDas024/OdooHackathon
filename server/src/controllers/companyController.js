import { PrismaClient } from '@prisma/client';
import { success } from '../middleware/errorHandler.js';
import { uploadToCloudinary } from '../middleware/upload.js';

const prisma = new PrismaClient();

// GET /api/v1/company
export async function getCompany(req, res, next) {
  try {
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({ data: { name: 'Odoo India' } });
    }
    return success(res, { company });
  } catch (err) { next(err); }
}

// PATCH /api/v1/company — Admin
export async function updateCompany(req, res, next) {
  try {
    const { name } = req.body;
    let logoUrl;

    if (req.file) {
      logoUrl = await uploadToCloudinary(req.file.buffer, 'hrms/company', 'image');
    }

    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({ data: { name: name || 'Odoo India', logoUrl } });
    } else {
      company = await prisma.company.update({
        where: { id: company.id },
        data: {
          ...(name !== undefined && { name }),
          ...(logoUrl !== undefined && { logoUrl }),
        },
      });
    }

    return success(res, { company }, 'Company details updated.');
  } catch (err) { next(err); }
}
