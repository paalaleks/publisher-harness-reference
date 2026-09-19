// Ticket 07 must replace this guard only after verified all-or-Hold import cutover.
if (process.env.HARNESS_REMEDIATION_VALIDATION !== '1') {
  throw new Error('Publication import cutover is not verified. Automatic repository builds are disabled.');
}
