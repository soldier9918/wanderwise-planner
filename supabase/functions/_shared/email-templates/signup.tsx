/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import { Body, Button, Container, Head, Heading, Hr, Html, Link, Text } from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

// Kept deliberately simple: no hidden preview padding, real text, plain-link fallback,
// and a clear sender footer. These help spam filters trust security emails.
export const SignupEmail = ({ siteName, siteUrl, recipient, confirmationUrl }: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Vydora</Text>
        <Heading style={h1}>Confirm your email</Heading>
        <Text style={text}>
          Thanks for signing up for {siteName}. Please confirm that {recipient} is your
          email address so you can start creating videos.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verify Email
        </Button>
        <Text style={small}>If the button doesn't work, copy and paste this link into your browser:</Text>
        <Text style={urlText}>
          <Link href={confirmationUrl} style={link}>{confirmationUrl}</Link>
        </Text>
        <Text style={text}>If you didn't create a Vydora account, you can ignore this email and no account will be activated.</Text>
        <Hr style={hr} />
        <Text style={footer}>
          Sent by Vydora, the AI YouTube video maker ·{' '}
          <Link href="https://vydora.ai" style={link}>vydora.ai</Link>
        </Text>
        <Text style={footer}>
          Questions? Email us at{' '}
          <Link href="mailto:contact@vydora.ai" style={link}>contact@vydora.ai</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Manrope, Arial, sans-serif' }
const container = { padding: '20px 25px', maxWidth: '560px' }
const brand = { fontSize: '20px', fontWeight: 'bold' as const, color: '#ea385c', margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#14110f', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#3f4147', lineHeight: '1.6', margin: '0 0 20px' }
const small = { fontSize: '13px', color: '#55575d', lineHeight: '1.5', margin: '24px 0 6px' }
const urlText = { fontSize: '12px', color: '#55575d', lineHeight: '1.5', margin: '0 0 20px', wordBreak: 'break-all' as const }
const link = { color: '#ea385c', textDecoration: 'underline' }
const button = {
  backgroundColor: '#ea385c', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const,
  fontFamily: 'Manrope, Arial, sans-serif', lineHeight: '20px', border: '1px solid #ea385c',
  borderRadius: '8px', padding: '12px 24px', display: 'inline-block', textAlign: 'center' as const, textDecoration: 'none',
}
const hr = { borderColor: '#e6e6e6', margin: '28px 0 16px' }
const footer = { fontSize: '12px', color: '#777777', lineHeight: '1.5', margin: '0 0 6px' }
