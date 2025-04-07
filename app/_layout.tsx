import React from 'react';
import { Stack } from 'expo-router';

const Layout = () => {
    return (
        <Stack>
            {/* Ensure all children are Stack.Screen */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="not-found" options={{ title: "Not Found" }} />
        </Stack>
    );
};

export default Layout;
