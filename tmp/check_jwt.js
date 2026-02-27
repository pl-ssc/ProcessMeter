try {
    const jwt = await import('jsonwebtoken');
    console.log('JSONWEBTOKEN_AVAILABLE');
} catch (e) {
    console.log('JSONWEBTOKEN_MISSING');
}
