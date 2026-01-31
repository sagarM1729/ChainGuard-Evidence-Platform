const { PrismaClient } = require('@prisma/client');

async function manageWhitelist() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔐 ChainGuard Evidence Platform - Whitelist Manager');
    console.log('=================================================\n');
    
    // Check current whitelist
    console.log('📋 Current Whitelist:');
    const currentWhitelist = await prisma.whitelist.findMany({
      orderBy: { email: 'asc' }
    });
    
    if (currentWhitelist.length === 0) {
      console.log('   (No entries found)\n');
    } else {
      currentWhitelist.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.email}`);
      });
      console.log('');
    }
    
    // Add some default authorized emails
    const emailsToAdd = [
      'test@example.com',
      'sagarmeshram1729@gmail.com',
      'admin@chainguard.com',
      'investigator@police.gov',
      'forensics@lab.org',
      'legal@court.gov'
    ];
    
    console.log('➕ Adding authorized emails to whitelist:');
    
    for (const email of emailsToAdd) {
      try {
        const existingEntry = await prisma.whitelist.findUnique({
          where: { email }
        });
        
        if (!existingEntry) {
          await prisma.whitelist.create({
            data: { 
              email 
            }
          });
          console.log(`   ✅ Added: ${email}`);
        } else {
          console.log(`   ⚠️  Already exists: ${email}`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to add ${email}: ${error.message}`);
      }
    }
    
    console.log('\n📋 Updated Whitelist:');
    const updatedWhitelist = await prisma.whitelist.findMany({
      orderBy: { email: 'asc' }
    });
    
    updatedWhitelist.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.email}`);
    });
    
    console.log('\n🎉 Whitelist updated successfully!');
    console.log('💡 You can also manage it via Prisma Studio at: http://localhost:5555');
    
  } catch (error) {
    console.error('❌ Error managing whitelist:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manageWhitelist();