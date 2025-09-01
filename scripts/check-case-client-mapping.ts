import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCaseClientMapping() {
  try {
    console.log('🔍 Checking Case-Client Relationships...\n')
    
    // Get all cases with their client and lawyer info
    const cases = await prisma.case.findMany({
      include: {
        client: {
          select: { id: true, name: true, email: true, role: true }
        },
        lawyer: {
          select: { id: true, name: true, email: true, role: true }
        },
        casePricing: {
          select: { id: true, status: true, totalEstimate: true }
        }
      }
    })

    console.log(`📊 Found ${cases.length} cases in database\n`)

    cases.forEach((caseItem, index) => {
      console.log(`Case ${index + 1}: "${caseItem.title}"`)
      console.log(`  - Case ID: ${caseItem.id}`)
      console.log(`  - Client: ${caseItem.client.name} (${caseItem.client.email}) [Role: ${caseItem.client.role}]`)
      console.log(`  - Client ID: ${caseItem.clientId}`)
      console.log(`  - Lawyer: ${caseItem.lawyer.name} (${caseItem.lawyer.email}) [Role: ${caseItem.lawyer.role}]`)
      console.log(`  - Lawyer ID: ${caseItem.lawyerId}`)
      console.log(`  - Has Pricing: ${caseItem.casePricing.length > 0 ? 'Yes' : 'No'}`)
      if (caseItem.casePricing.length > 0) {
        caseItem.casePricing.forEach((pricing, pIndex) => {
          console.log(`    Pricing ${pIndex + 1}: Status=${pricing.status}, Amount=$${pricing.totalEstimate}`)
        })
      }
      console.log('  ---')
    })

    // Check for any orphaned cases (cases without valid client/lawyer)
    const orphanedCases = cases.filter(c => !c.client || !c.lawyer)
    if (orphanedCases.length > 0) {
      console.log(`⚠️  Found ${orphanedCases.length} orphaned cases:`)
      orphanedCases.forEach(c => {
        console.log(`  - "${c.title}" (ID: ${c.id})`)
        console.log(`    Missing client: ${!c.client}`)
        console.log(`    Missing lawyer: ${!c.lawyer}`)
      })
    }

    // Get all users to verify roles
    console.log('\n👥 User Roles Summary:')
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    })
    
    const clients = users.filter(u => u.role === 'CLIENT')
    const lawyers = users.filter(u => u.role === 'LAWYER')
    
    console.log(`  - Clients: ${clients.length}`)
    clients.forEach(c => console.log(`    ${c.name} (${c.email})`))
    
    console.log(`  - Lawyers: ${lawyers.length}`)
    lawyers.forEach(l => console.log(`    ${l.name} (${l.email})`))

  } catch (error) {
    console.error('❌ Error checking case-client mapping:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCaseClientMapping()
