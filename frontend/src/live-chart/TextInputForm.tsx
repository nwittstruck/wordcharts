import React, { useState, useContext } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import { WebsocketContext } from '../shared/PhoenixWebsocketProvider'
import { FormattedMessage } from 'react-intl'

// See https://github.com/spencermountain/compromise/blob/master/types/misc.ts
export interface Term {
  text: string
  pre: string
  post: string
  normal: string

  // in /two
  tags?: Set<string>
  index?: [n?: number, start?: number]
  id?: string
  chunk?: string
  dirty?: boolean

  // other things you may find...
  syllables?: string[]
}

function TextInputForm(): React.ReactElement {
  const [inputText, setInputText] = useState<string>('')
  const { channel, adminId } = useContext(WebsocketContext)
  const [waitingForChannelPush, setWaitingForChannelPush] = useState<boolean>(false)
  const [completedChannelPush, setCompletedChannelPush] = useState<boolean>(false)

  const submit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    if (channel === undefined) return

    (event.target as HTMLFormElement).reset()
    event.preventDefault()

    setWaitingForChannelPush(true)
    setCompletedChannelPush(false)
    channel.push('new_words', { words: inputText, admin_url_id: adminId })
      .receive('ok', () => {
        setWaitingForChannelPush(false)
        setCompletedChannelPush(true)
      })
  }

  return (
    <div>
      {waitingForChannelPush && !completedChannelPush &&
        <Alert key="primary" variant="primary">
          <FormattedMessage
            id="live.text.loading"
            defaultMessage="Request is being processed..."
          />

        </Alert>
      }
      {completedChannelPush &&
        <Alert key="primary" variant="primary">
          <FormattedMessage
            id="live.text.success"
            defaultMessage="Words added. Depending on the chosen filter they might not be visible yet."
          />

        </Alert>
      }
      {!waitingForChannelPush &&
        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              placeholder="Text"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setInputText((e.target as HTMLTextAreaElement).value) }}
              onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  // add word with form submit:
                  e.currentTarget.form?.requestSubmit()
                } else {
                  // dont interfere with input:
                  return null
                }
              }}
              data-testid="test-input-control-text"
            />
            <div className="d-flex justify-content-end">
              <Button type="submit" variant="primary" className="mt-1">
                <FormattedMessage
                  id="live.text.button.submit"
                  defaultMessage="Add Text"
                />
              </Button>
            </div>
          </Form.Group>
        </Form>
      }
    </div>
  )
}

export { TextInputForm }
