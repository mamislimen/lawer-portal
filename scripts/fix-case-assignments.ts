import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixCaseAssignments() {
  try {
    console.log('🔧 Fixing Case Assignments...\n')
    
    // Get the proper lawyer (John Doe)
    const lawyer = await prisma.user.findFirst({
      where: { role: 'LAWYER' }
    })
    
    if (!lawyer) {
      console.log('❌ No lawyer found in database')
      return
    }
    
    console.log(`✅ Found lawyer: ${lawyer.name} (${lawyer.email})`)
    
    // Get all cases where lawyerId points to a CLIENT role user
    const problematicCases = await prisma.case.findMany({
      where: {
        lawyer: {
          role: 'CLIENT'
        }
      },
      include: {
        client: true,
        lawyer: true
      }
    })
    
    console.log(`🔍 Found ${problematicCases.length} cases with incorrect lawyer assignments`)
    
    // Fix each case by assigning the proper lawyer
    for (const caseItem of problematicCases) {
      console.log(`Fixing case: "${caseItem.title}"`)
      console.log(`  - Current lawyer: ${caseItem.lawyer.name} (${caseItem.lawyer.role})`)
      console.log(`  - Client: ${caseItem.client.name} (${caseItem.client.role})`)
      
      await prisma.case.update({
        where: { id: caseItem.id },
        data: { lawyerId: lawyer.id }
      })
      
      console.log(`  ✅ Updated lawyer to: ${lawyer.name}`)
    }
    
    // Update any DRAFT pricing to SENT so clients can see them
    const draftPricing = await prisma.casePricing.updateMany({
      where: { status: 'DRAFT' },
      data: { 
        status: 'SENT',
        sentAt: new Date()
      }
    })
    
    console.log(`\n📤 Updated ${draftPricing.count} pricing records from DRAFT to SENT`)
    
    console.log('\n✅ All fixes completed!')
    
  } catch (error) {
    console.error('❌ Error fixing case assignments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCaseAssignments()
