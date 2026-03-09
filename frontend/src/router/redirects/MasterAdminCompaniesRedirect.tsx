import { Navigate, useParams } from 'react-router-dom'

interface Props {
  to: string
}

export default function MasterAdminCompaniesRedirect({ to }: Props) {
  const params = useParams()
  let target = to
  Object.entries(params).forEach(([k, v]) => {
    if (v) target = target.replace(`:${k}`, v)
  })
  return <Navigate to={target} replace />
}

